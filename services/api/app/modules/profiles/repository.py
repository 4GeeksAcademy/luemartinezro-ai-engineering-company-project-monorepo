"""
Profiles module — TinyDB repository.

Handles all direct TinyDB operations for the Profile model.
Profiles are linked 1:1 to User via user_id.
"""

from tinydb import where

from app.db.tinydb import get_table

PROFILE_TABLE = "profiles"


class ProfileRepository:
    """Data-access layer for Profile records in TinyDB."""

    def __init__(self):
        self.table = get_table(PROFILE_TABLE)

    def create(self, user_id: int, name: str = "", phone: str = "", address: str = "") -> dict:
        """Insert a new profile linked to a user."""
        doc_id = self.table.insert({
            "user_id": user_id,
            "name": name,
            "phone": phone,
            "address": address,
        })
        return self.get_by_id(doc_id)

    def get_by_id(self, profile_id: int) -> dict | None:
        """Return a profile by its own doc_id."""
        doc = self.table.get(doc_id=profile_id)
        if doc is None:
            return None
        doc["id"] = profile_id
        return doc

    def get_by_user_id(self, user_id: int) -> dict | None:
        """Return the profile linked to a given user_id, or None."""
        results = self.table.search(where("user_id") == user_id)
        if not results:
            return None
        doc = results[0]
        doc["id"] = doc.doc_id
        return doc

    def update_by_user_id(self, user_id: int, updates: dict) -> dict | None:
        """Update the profile for a given user. Returns updated profile or None."""
        profile = self.get_by_user_id(user_id)
        if profile is None:
            return None
        if not updates:
            return profile
        self.table.update(updates, where("user_id") == user_id)
        return self.get_by_user_id(user_id)

    def delete_by_user_id(self, user_id: int) -> bool:
        """Delete the profile linked to a user. Returns True if deleted."""
        profile = self.get_by_user_id(user_id)
        if profile is None:
            return False
        self.table.remove(where("user_id") == user_id)
        return True