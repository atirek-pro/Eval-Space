"""Sign-in rate limiting, kept in Postgres so it holds across restarts and any number of workers.

Each attempt is written to signin_attempts *before* the password is checked, then counted. Because the
row is committed before the count runs, a burst of parallel requests can't all slip under the limit.
A successful sign-in deletes that email's rows; a failed one keeps its row. Refused attempts delete
their own row, so hammering a locked account doesn't extend the lock.
"""
import math
from datetime import timedelta

import asyncpg

from config import get_settings
from .services import _normalize_email


class TooManyAttempts(Exception):
    def __init__(self, retry_after: int):
        super().__init__(f"retry after {retry_after}s")
        self.retry_after = retry_after  # seconds until the next attempt is allowed


def _wait(times: list, limit: int, window: timedelta, now) -> float | None:
    """Seconds until fewer than `limit` of these failures are left in the window, or None if not blocked."""
    if len(times) < limit:
        return None
    return (times[len(times) - limit] + window - now).total_seconds()


async def begin_signin(conn: asyncpg.Connection, email: str, ip: str) -> None:
    """Records the attempt. Raises TooManyAttempts when the email or the IP has used up its failures."""
    settings = get_settings()
    email = _normalize_email(email)
    window = timedelta(minutes=settings.signin_lockout_minutes)

    attempt_id = await conn.fetchval(
        "INSERT INTO signin_attempts (email, ip) VALUES ($1, $2) RETURNING id", email, ip
    )
    # Every other attempt still inside the window, oldest first, by email and by IP.
    row = await conn.fetchrow(
        """SELECT now() AS now,
                  ARRAY(SELECT attempted_at FROM signin_attempts
                        WHERE email = $1 AND attempted_at > now() - $3::interval AND id <> $4
                        ORDER BY attempted_at) AS by_email,
                  ARRAY(SELECT attempted_at FROM signin_attempts
                        WHERE ip = $2 AND attempted_at > now() - $3::interval AND id <> $4
                        ORDER BY attempted_at) AS by_ip""",
        email,
        ip,
        window,
        attempt_id,
    )
    waits = [
        w
        for w in (
            _wait(row["by_email"], settings.signin_max_failures_per_email, window, row["now"]),
            _wait(row["by_ip"], settings.signin_max_failures_per_ip, window, row["now"]),
        )
        if w is not None
    ]
    if waits:
        await conn.execute("DELETE FROM signin_attempts WHERE id = $1", attempt_id)
        raise TooManyAttempts(max(1, math.ceil(max(waits))))


async def signin_failed(conn: asyncpg.Connection) -> None:
    """The attempt's row stays as a failure. Also drops rows too old to matter, so the table stays small."""
    await conn.execute(
        "DELETE FROM signin_attempts WHERE attempted_at < now() - $1::interval",
        timedelta(minutes=get_settings().signin_lockout_minutes),
    )


async def signin_succeeded(conn: asyncpg.Connection, email: str) -> None:
    """The right password clears this email's failures (and this attempt's own row)."""
    await conn.execute("DELETE FROM signin_attempts WHERE email = $1", _normalize_email(email))
