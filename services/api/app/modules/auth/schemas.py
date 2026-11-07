"""
Auth module — Pydantic schemas for authentication endpoints.
"""

from pydantic import BaseModel, EmailStr

from app.modules.profiles.schemas import ProfileResponse


class LoginRequest(BaseModel):
    """Payload for POST /auth/login."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Response for successful login."""

    access_token: str
    token_type: str = "bearer"


class AuthMeResponse(BaseModel):
    """Response for GET /auth/me — email, role, and linked profile."""

    id: int
    email: str
    role: str
    is_active: bool
    profile: ProfileResponse | None = None