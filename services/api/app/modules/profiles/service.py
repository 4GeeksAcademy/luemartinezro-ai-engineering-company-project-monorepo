"""
Profiles module — Business logic layer.

Coordinates profile read/update operations.
"""

from app.core.errors import not_found
from app.modules.profiles.repository import ProfileRepository
from app.modules.profiles.schemas import ProfileUpdate


class ProfileService:
    """Business logic for Profile operations."""

    def __init__(self):
        self.repo = ProfileRepository()

    def get_profile_by_user_id(self, user_id: int) -> dict:
        """Return the profile for a given user. Raises 404 if not found."""
        profile = self.repo.get_by_user_id(user_id)
        if profile is None:
            # Auto-create an empty profile if it doesn't exist
            profile = self.repo.create(user_id=user_id)
        return profile

    def update_profile(self, user_id: int, payload: ProfileUpdate) -> dict:
        """Update profile fields for the authenticated user."""
        existing = self.repo.get_by_user_id(user_id)
        if existing is None:
            self.repo.create(user_id=user_id)

        updates: dict = {}
        if payload.name is not None:
            updates["name"] = payload.name
        if payload.phone is not None:
            updates["phone"] = payload.phone
        if payload.address is not None:
            updates["address"] = payload.address

        updated = self.repo.update_by_user_id(user_id, updates)
        return updated