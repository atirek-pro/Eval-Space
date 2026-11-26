import uuid

import asyncpg

from config import get_settings
from .security import (
    InvalidToken,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

_USER_COLUMNS = "id, full_name, email, created_at"


class EmailTaken(Exception):
    pass


class AccountExists(Exception):
    """A Google or GitHub sign-in whose email already belongs to an account it isn't linked to."""


def _normalize_email(email: str) -> str:
    return email.strip().lower()


async def get_user_by_id(conn: asyncpg.Connection, user_id: uuid.UUID) -> dict | None:
    row = await conn.fetchrow(f"SELECT {_USER_COLUMNS} FROM users WHERE id = $1", user_id)
    return dict(row) if row else None


async def create_user(conn: asyncpg.Connection, full_name: str, email: str, password: str) -> dict:
    try:
        row = await conn.fetchrow(
            f"INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING {_USER_COLUMNS}",
            full_name,
            _normalize_email(email),
            hash_password(password),
        )
    except asyncpg.UniqueViolationError as exc:
        raise EmailTaken from exc
    return dict(row)


async def authenticate(conn: asyncpg.Connection, email: str, password: str) -> dict | None:
    """Returns the user when the email and password match, otherwise None."""
    row = await conn.fetchrow(
        f"SELECT {_USER_COLUMNS}, password_hash FROM users WHERE email = $1", _normalize_email(email)
    )
    if not verify_password(password, row["password_hash"] if row else None):
        return None
    user = dict(row)
    user.pop("password_hash")
    return user


async def sign_in_with_sso(conn: asyncpg.Connection, profile: dict) -> dict:
    """Returns the user linked to this Google or GitHub account, creating one on its first sign-in.

    An email that already has an account is never linked automatically: that account may have been
    created by someone else with this person's email, and linking would hand it to them. Raises
    AccountExists instead, so the person signs in the way they did before.
    """
    row = await conn.fetchrow(
        """SELECT u.id, u.full_name, u.email, u.created_at
           FROM oauth_accounts o JOIN users u ON u.id = o.user_id
           WHERE o.provider = $1 AND o.provider_user_id = $2""",
        profile["provider"],
        profile["provider_user_id"],
    )
    if row:
        return dict(row)

    async with conn.transaction():
        try:
            user = await conn.fetchrow(
                f"INSERT INTO users (full_name, email) VALUES ($1, $2) RETURNING {_USER_COLUMNS}",
                profile["full_name"].strip()[:100],
                _normalize_email(profile["email"]),
            )
        except asyncpg.UniqueViolationError as exc:
            raise AccountExists from exc
        await conn.execute(
            "INSERT INTO oauth_accounts (provider, provider_user_id, user_id) VALUES ($1, $2, $3)",
            profile["provider"],
            profile["provider_user_id"],
            user["id"],
        )
    return dict(user)


async def issue_tokens(conn: asyncpg.Connection, user_id: uuid.UUID) -> dict:
    refresh_token, session_id, expires_at = create_refresh_token(user_id)
    await conn.execute(
        "INSERT INTO refresh_tokens (session_id, user_id, expires_at) VALUES ($1, $2, $3)",
        session_id,
        user_id,
        expires_at,
    )
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": refresh_token,
        "expires_in": get_settings().access_token_minutes * 60,
    }


async def rotate_refresh_token(conn: asyncpg.Connection, refresh_token: str) -> dict:
    """Spends a refresh token and returns a new pair. Raises InvalidToken.

    Each refresh token works once. If a token that was already spent comes back, it has probably been
    stolen, so every session of that user is ended.
    """
    payload = decode_token(refresh_token, "refresh")
    user_id, session_id = payload["sub"], payload["jti"]

    async with conn.transaction():
        spent = await conn.fetchval(
            """UPDATE refresh_tokens SET revoked_at = now()
               WHERE session_id = $1 AND user_id = $2 AND revoked_at IS NULL AND expires_at > now()
               RETURNING session_id""",
            session_id,
            user_id,
        )
        if spent:
            return await issue_tokens(conn, user_id)

    reused = await conn.fetchval(
        "SELECT revoked_at IS NOT NULL FROM refresh_tokens WHERE session_id = $1 AND user_id = $2",
        session_id,
        user_id,
    )
    if reused:
        await revoke_all_refresh_tokens(conn, user_id)
    raise InvalidToken


async def revoke_refresh_token(conn: asyncpg.Connection, refresh_token: str) -> None:
    """Ends one session. An invalid token is ignored, so signing out never fails."""
    try:
        payload = decode_token(refresh_token, "refresh")
    except InvalidToken:
        return
    await conn.execute(
        "UPDATE refresh_tokens SET revoked_at = now() WHERE session_id = $1 AND revoked_at IS NULL", payload["jti"]
    )


async def revoke_all_refresh_tokens(conn: asyncpg.Connection, user_id: uuid.UUID) -> None:
    await conn.execute(
        "UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", user_id
    )
