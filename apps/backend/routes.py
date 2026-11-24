from typing import Annotated

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import get_db
from schemas import AuthResponse, RefreshRequest, SignInRequest, SignUpRequest, TokenPair, UserOut
from security import InvalidToken, decode_token
from services import (
    EmailTaken,
    authenticate,
    create_user,
    get_user_by_id,
    issue_tokens,
    revoke_refresh_token,
    rotate_refresh_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])

DB = Annotated[asyncpg.Connection, Depends(get_db)]
_bearer = HTTPBearer(auto_error=False)


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
async def signup(body: SignUpRequest, db: DB):
    try:
        user = await create_user(db, body.full_name, body.email, body.password)
    except EmailTaken:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")
    return {**await issue_tokens(db, user["id"]), "user": user}


@router.post("/signin", response_model=AuthResponse)
async def signin(body: SignInRequest, db: DB):
    user = await authenticate(db, body.email, body.password)
    if user is None:
        raise _unauthorized("Incorrect email or password")
    return {**await issue_tokens(db, user["id"]), "user": user}


@router.post("/refresh", response_model=TokenPair)
async def refresh(body: RefreshRequest, db: DB):
    try:
        return await rotate_refresh_token(db, body.refresh_token)
    except InvalidToken:
        raise _unauthorized("Invalid or expired refresh token")


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(body: RefreshRequest, db: DB):
    await revoke_refresh_token(db, body.refresh_token)


@router.get("/me", response_model=UserOut)
async def me(user: Annotated[dict, Depends(current_user)]):
    return user
