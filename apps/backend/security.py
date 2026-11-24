import uuid
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from config import get_settings

_hasher = PasswordHash.recommended()  # Argon2id

# Checked against when an email is unknown, so a sign-in takes as long whether or not the account exists.
_DUMMY_HASH = _hasher.hash("dummy-password-for-timing")


class InvalidToken(Exception):
    pass


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    if password_hash is None:
        _hasher.verify(password, _DUMMY_HASH)
        return False
    return _hasher.verify(password, password_hash)


def _encode(claims: dict, lifetime: timedelta) -> tuple[str, datetime]:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expires_at = now + lifetime
    token = jwt.encode(
        {**claims, "iat": now, "exp": expires_at},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )
    return token, expires_at


def create_access_token(user_id: uuid.UUID) -> str:
    lifetime = timedelta(minutes=get_settings().access_token_minutes)
    token, _ = _encode({"sub": str(user_id), "type": "access"}, lifetime)
    return token


def create_refresh_token(user_id: uuid.UUID) -> tuple[str, uuid.UUID, datetime]:
    """Returns the token, its session id (stored so it can be revoked) and when it expires.

    The session id travels inside the token as "jti", the standard JWT claim for a token's id.
    """
    session_id = uuid.uuid4()
    lifetime = timedelta(days=get_settings().refresh_token_days)
    token, expires_at = _encode({"sub": str(user_id), "type": "refresh", "jti": str(session_id)}, lifetime)
    return token, session_id, expires_at


def decode_token(token: str, expected_type: str) -> dict:
    """Verifies signature, expiry and type. Raises InvalidToken on any failure."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["sub", "type", "iat", "exp"]},
        )
        if payload["type"] != expected_type:
            raise InvalidToken
        payload["sub"] = uuid.UUID(payload["sub"])
        if expected_type == "refresh":
            payload["jti"] = uuid.UUID(payload["jti"])
    except (jwt.PyJWTError, KeyError, ValueError) as exc:
        raise InvalidToken from exc
    return payload
