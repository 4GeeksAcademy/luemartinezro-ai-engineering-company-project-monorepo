"""
Users module — TinyDB repository.

Handles all direct TinyDB operations for the User model.
"""

from datetime import datetime, timezone

from tinydb import where

from app.db.tinydb import get_table

USER_TABLE = "users"


class UserRepository:
    """Data-access layer for User records in TinyDB."""

    def __init__(self):
        self.table = get_table(USER_TABLE)

    def create(self, email: str, hashed_password: str, role: str, is_active: bool = True) -> dict:
        """Insert a new user document and return it with the assigned doc_id."""
        doc_id = self.table.insert({
            "email": email,
            "hashed_password": hashed_password,
            "role": role,
            "is_active": is_active,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        return self.get_by_id(doc_id)

    def get_by_id(self, user_id: int) -> dict | None:
        """Return a user by TinyDB doc_id, or None."""
        doc = self.table.get(doc_id=user_id)
        if doc is None:
            return None
        doc["id"] = user_id
        return doc

    def get_by_email(self, email: str) -> dict | None:
        """Return the first user matching the given email, or None."""
        results = self.table.search(where("email") == email)
        if not results:
            return None
        doc = results[0]
        doc["id"] = doc.doc_id
        return doc

    def get_all(self) -> list[dict]:
        """Return all users."""
        docs = self.table.all()
        for doc in docs:
            doc["id"] = doc.doc_id
        return docs

    def update(self, user_id: int, updates: dict) -> dict | None:
        """Update a user document. Returns the updated user or None."""
        if not updates:
            return self.get_by_id(user_id)
        self.table.update(updates, doc_ids=[user_id])
        return self.get_by_id(user_id)

    def delete(self, user_id: int) -> bool:
        """Delete a user by doc_id. Returns True if deleted."""
        old = self.table.get(doc_id=user_id)
        if old is None:
            return False
        self.table.remove(doc_ids=[user_id])
        return True