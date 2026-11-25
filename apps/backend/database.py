from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import asyncpg
from fastapi import Request

# The tables and columns the code relies on. The schema itself is created only by sql-scripts.sql;
# the app never creates or changes tables, it just refuses to start when they are missing.
REQUIRED_TABLES = {
    "users": {"id", "full_name", "email", "password_hash", "created_at"},
    "refresh_tokens": {"session_id", "user_id", "expires_at", "revoked_at", "created_at"},
    "oauth_accounts": {"provider", "provider_user_id", "user_id", "created_at"},
    "signin_attempts": {"id", "email", "ip", "attempted_at"},
}
# Columns that must accept NULL: Google and GitHub accounts have no password.
NULLABLE_COLUMNS = {("users", "password_hash")}

# Neon's connection string carries libpq-only options that asyncpg would send to the server as settings.
_LIBPQ_ONLY = {"channel_binding"}


def _clean_dsn(dsn: str) -> str:
    parts = urlsplit(dsn)
    query = [(k, v) for k, v in parse_qsl(parts.query) if k not in _LIBPQ_ONLY]
    return urlunsplit(parts._replace(query=urlencode(query)))


async def create_pool(dsn: str) -> asyncpg.Pool:
    # statement_cache_size=0 keeps it safe behind Neon's pooled (PgBouncer) endpoint.
    return await asyncpg.create_pool(_clean_dsn(dsn), min_size=1, max_size=10, statement_cache_size=0)


async def verify_schema(pool: asyncpg.Pool) -> None:
    """Read-only startup check. Raises RuntimeError naming every missing table or column."""
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """SELECT table_name, column_name, is_nullable FROM information_schema.columns
               WHERE table_schema = current_schema() AND table_name = ANY($1::text[])""",
            list(REQUIRED_TABLES),
        )
    found: dict[str, set[str]] = {}
    not_null = set()
    for row in rows:
        found.setdefault(row["table_name"], set()).add(row["column_name"])
        if row["is_nullable"] == "NO":
            not_null.add((row["table_name"], row["column_name"]))

    problems = []
    for table, columns in REQUIRED_TABLES.items():
        if table not in found:
            problems.append(f"missing table {table}")
        else:
            problems += [f"missing column {table}.{col}" for col in sorted(columns - found[table])]
    problems += [f"{table}.{col} must allow NULL" for table, col in sorted(NULLABLE_COLUMNS & not_null)]
    if problems:
        raise RuntimeError(
            f"Database schema is out of date: {'; '.join(problems)}. Run sql-scripts.sql against the database."
        )


async def get_db(request: Request):
    """FastAPI dependency: one pooled connection per request."""
    async with request.app.state.pool.acquire() as conn:
        yield conn
