from typing import Annotated

import asyncpg
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import sso
from config import get_settings
from database import get_db
from rate_limit import TooManyAttempts, begin_signin, signin_failed, signin_succeeded
from schemas import AccessToken, AuthResponse, SignInRequest, SignUpRequest, SSOCodeRequest, UserOut
from security import InvalidToken, decode_token
from services import (
    AccountExists,
    EmailTaken,
    authenticate,
    create_user,
    get_user_by_id,
    issue_tokens,
    revoke_refresh_token,
    rotate_refresh_token,
    sign_in_with_sso,
)

router = APIRouter(prefix="/auth", tags=["auth"])
sso_router = APIRouter(prefix="/auth/sso", tags=["sso-signin"])

DB = Annotated[asyncpg.Connection, Depends(get_db)]
_bearer = HTTPBearer(auto_error=False)

# The refresh token lives only in this httpOnly cookie, so page scripts (and any XSS) can never read it.
# Path=/auth: the browser sends it to the auth endpoints and nowhere else.
REFRESH_COOKIE = "evalspace_refresh"
_COOKIE_PATH = "/auth"
RefreshCookie = Annotated[str | None, Cookie(alias=REFRESH_COOKIE, include_in_schema=False)]


def _set_refresh_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        REFRESH_COOKIE,
        token,
        max_age=settings.refresh_token_days * 24 * 3600,
        path=_COOKIE_PATH,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )


def _clear_refresh_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        REFRESH_COOKIE,
        path=_COOKIE_PATH,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )


def _session(response: Response, tokens: dict, **extra) -> dict:
    """Moves the refresh token from the issued pair into the cookie; the body keeps only the access token."""
    _set_refresh_cookie(response, tokens.pop("refresh_token"))
    return {**tokens, **extra}


def _check_origin(request: Request) -> None:
    """CSRF guard for the cookie endpoints: the browser attaches the cookie by itself, so a request coming
    from another site's page is refused. Requests without an Origin header (not from a browser page) pass."""
    origin = request.headers.get("origin")
    if origin is not None and origin not in get_settings().cors_origins:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Origin not allowed")


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(status.HTTP_401_UNAUTHORIZED, detail, headers={"WWW-Authenticate": "Bearer"})


async def current_user(
    db: DB, credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)]
) -> dict:
    """Dependency for protected routes: the user behind a valid access token."""
    if credentials is None:
        raise _unauthorized("Not signed in")
    try:
        payload = decode_token(credentials.credentials, "access")
    except InvalidToken:
        raise _unauthorized("Invalid or expired access token")
    user = await get_user_by_id(db, payload["sub"])
    if user is None:
        raise _unauthorized("Account no longer exists")
    return user


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignUpRequest, response: Response, db: DB):
    try:
        user = await create_user(db, body.full_name, body.email, body.password)
    except EmailTaken:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")
    return _session(response, await issue_tokens(db, user["id"]), user=user)


def _wait_text(seconds: int) -> str:
    minutes = -(-seconds // 60)  # round up
    return "1 minute" if minutes == 1 else f"{minutes} minutes"


@router.post(
    "/signin",
    response_model=AuthResponse,
    responses={429: {"description": "Too many failed attempts for this email or from this IP. See Retry-After."}},
)
async def signin(body: SignInRequest, request: Request, response: Response, db: DB):
    # Behind a proxy, run uvicorn with --proxy-headers so this is the visitor's IP, not the proxy's.
    ip = request.client.host if request.client else "unknown"
    try:
        await begin_signin(db, body.email, ip)
    except TooManyAttempts as exc:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            f"Too many sign-in attempts. Try again in {_wait_text(exc.retry_after)}.",
            headers={"Retry-After": str(exc.retry_after)},
        )
    user = await authenticate(db, body.email, body.password)
    if user is None:
        await signin_failed(db)
        raise _unauthorized("Incorrect email or password")
    await signin_succeeded(db, body.email)
    return _session(response, await issue_tokens(db, user["id"]), user=user)


@router.post("/refresh", response_model=AccessToken, dependencies=[Depends(_check_origin)])
async def refresh(response: Response, db: DB, refresh_token: RefreshCookie = None):
    """Spends the refresh token cookie: sets a new one and returns a new access token."""
    try:
        if not refresh_token:
            raise InvalidToken
        return _session(response, await rotate_refresh_token(db, refresh_token))
    except InvalidToken:
        # a plain JSONResponse, because cookies set on `response` are dropped when an HTTPException is raised
        failed = JSONResponse(
            {"detail": "Invalid or expired refresh token"},
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Bearer"},
        )
        _clear_refresh_cookie(failed)
        return failed


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(_check_origin)])
async def logout(response: Response, db: DB, refresh_token: RefreshCookie = None):
    """Ends this session and removes the cookie. Always succeeds."""
    if refresh_token:
        await revoke_refresh_token(db, refresh_token)
    _clear_refresh_cookie(response)


@router.get("/me", response_model=UserOut)
async def me(user: Annotated[dict, Depends(current_user)]):
    return user


async def _sso_sign_in(provider_name: str, fetch_profile, code: str, db, response: Response) -> dict:
    """Shared by the Google and GitHub endpoints: code -> provider profile -> user -> tokens."""
    try:
        profile = await fetch_profile(code)
    except sso.SSONotConfigured:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, f"{provider_name} sign-in isn't set up on this server")
    except sso.SSOError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc))
    except sso.SSOProviderUnavailable:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Couldn't reach {provider_name}. Try again.")

    try:
        user = await sign_in_with_sso(db, profile)
    except AccountExists:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "An account with this email already exists. Sign in the way you did before.",
        )
    return _session(response, await issue_tokens(db, user["id"]), user=user)


@sso_router.post("/google", response_model=AuthResponse, summary="Sign in with Google")
async def sso_google(body: SSOCodeRequest, response: Response, db: DB):
    """Exchanges the code from Google's redirect for tokens. Creates the account on first sign-in."""
    return await _sso_sign_in("Google", sso.fetch_google_profile, body.code, db, response)


@sso_router.post("/github", response_model=AuthResponse, summary="Sign in with GitHub")
async def sso_github(body: SSOCodeRequest, response: Response, db: DB):
    """Exchanges the code from GitHub's redirect for tokens. Creates the account on first sign-in."""
    return await _sso_sign_in("GitHub", sso.fetch_github_profile, body.code, db, response)
