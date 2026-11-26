from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App settings, read from the environment or backend/.env."""

    model_config = SettingsConfigDict(env_file=Path(__file__).parent / ".env", extra="ignore")

    database_url: str
    jwt_secret: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 15
    refresh_token_days: int = 2
    cors_origins: list[str] = ["http://localhost:3000"]

    # The refresh token's httpOnly cookie. Browsers accept Secure cookies on http://localhost, so keep it on.
    cookie_secure: bool = True
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"

    # Sign-in rate limiting: this many failed attempts within the window locks that email, or that IP,
    # until the oldest of them is older than the window.
    signin_max_failures_per_email: int = Field(default=5, ge=1)
    signin_max_failures_per_ip: int = Field(default=20, ge=1)
    signin_lockout_minutes: int = Field(default=15, ge=1)

    # Google and GitHub sign-in. Each provider's endpoint answers 503 until its three values are set.
    # The redirect URI must match exactly the one registered with the provider and used by the frontend.
    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_redirect_uri: str | None = None
    github_client_id: str | None = None
    github_client_secret: str | None = None
    github_redirect_uri: str | None = None

    # Gemini, through Google's official SDK (eval_features). /eval/query answers 503 until the key is set.
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3.8-flash"  # used when a request names no model
    gemini_timeout_seconds: int = Field(default=60, ge=1)


@lru_cache
def get_settings() -> Settings:
    return Settings()
