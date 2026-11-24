"""
Auth module — Pydantic schemas for authentication endpoints.
"""

from pydantic import BaseModel, EmailStr, Field

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


# ── Password Reset Schemas ──


class ForgotPasswordRequest(BaseModel):
    """Payload for POST /auth/forgot-password."""

    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    """Always returns a generic confirmation message to prevent user enumeration."""

    message: str = "If that address is registered, you'll receive a password reset link shortly."


class ResetPasswordRequest(BaseModel):
    """Payload for POST /auth/reset-password."""

    token: str
    new_password: str = Field(..., min_length=6, description="New password (min 6 characters)")


class ResetPasswordResponse(BaseModel):
    """Response for successful password reset."""

    message: str = "Password has been reset successfully. You can now log in with your new password."


class ChangePasswordRequest(BaseModel):
    """Payload for POST /auth/change-password."""

    current_password: str
    new_password: str = Field(..., min_length=6, description="New password (min 6 characters)")


class ChangePasswordResponse(BaseModel):
    """Response for successful password change."""

    message: str = "Password has been changed successfully."