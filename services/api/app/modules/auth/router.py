"""
Auth router — /auth endpoints.

- POST /auth/login (public) — validate credentials, return JWT
- GET  /auth/me (protected) — return authenticated user info + profile
"""

from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.modules.auth.schemas import AuthMeResponse, LoginRequest, TokenResponse
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