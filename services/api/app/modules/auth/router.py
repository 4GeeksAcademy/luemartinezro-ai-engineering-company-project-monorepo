"""
Auth router — /auth endpoints.

- POST /auth/login (public) — validate credentials, return JWT
- GET  /auth/me (protected) — return authenticated user info + profile
- POST /auth/forgot-password (public) — send reset link via email
- POST /auth/reset-password (public) — validate token and update password
- POST /auth/change-password (protected) — change password while logged in
"""

from fastapi import APIRouter, Depends, Request

from app.core.security import get_current_user
from app.modules.auth.schemas import (
    AuthMeResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    ResetPasswordRequest,
    ResetPasswordResponse,
    TokenResponse,
)
from app.modules.auth.service import AuthService
from app.modules.profiles.service import ProfileService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    """Authenticate with email and password. Returns a JWT token."""
    service = AuthService()
    return service.login(payload)


@router.get("/me", response_model=AuthMeResponse)
async def auth_me(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's email, role, and linked profile."""
    profile_service = ProfileService()
    profile = profile_service.get_profile_by_user_id(current_user["id"])

    return AuthMeResponse(
        id=current_user["id"],
        email=current_user["email"],
        role=current_user["role"],
        is_active=current_user.get("is_active", True),
        profile=profile,
    )


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(payload: ForgotPasswordRequest, request: Request):
    """
    Request a password reset link.

    Always returns 200 regardless of whether the email exists, to prevent
    user enumeration. If the user exists, generates a signed short-lived
    reset token and sends it via email.
    """
    service = AuthService()
    service.request_password_reset(payload.email, request)
    return ForgotPasswordResponse()


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(payload: ResetPasswordRequest):
    """
    Reset password using a valid reset token.

    Validates the token (signature + expiry + not already used).
    On success, hashes the new password, updates the user record,
    and invalidates the token.
    """
    service = AuthService()
    service.reset_password(payload.token, payload.new_password)
    return ResetPasswordResponse()


@router.post("/change-password", response_model=ChangePasswordResponse)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Change password while logged in.

    Requires a valid session token. Verifies the current password
    before updating to the new one.
    """
    service = AuthService()
    service.change_password(current_user["id"], payload.current_password, payload.new_password)
    return ChangePasswordResponse()