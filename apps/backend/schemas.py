import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, StringConstraints

FullName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


class SignUpRequest(BaseModel):
    full_name: FullName
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class SignInRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class SSOCodeRequest(BaseModel):
    """The authorization code Google or GitHub sent back to the frontend's redirect URI."""

    code: str = Field(min_length=1, max_length=2048)


class UserOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    created_at: datetime


class AccessToken(BaseModel):
    """The refresh token never appears in a body: it travels only in the httpOnly evalspace_refresh cookie."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int  # access token lifetime in seconds


class AuthResponse(AccessToken):
    user: UserOut
