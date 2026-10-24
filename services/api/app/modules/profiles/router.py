"""
Profiles router — /profiles endpoints.

All endpoints are protected (require valid JWT).
"""

from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.modules.profiles.schemas import ProfileResponse, ProfileUpdate
from app.modules.profiles.service import ProfileService

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Return the profile of the authenticated user."""
    service = ProfileService()
    profile = service.get_profile_by_user_id(current_user["id"])
    return profile


@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    payload: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update the profile of the authenticated user."""
    service = ProfileService()
    profile = service.update_profile(current_user["id"], payload)
    return profile