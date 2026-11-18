"""
Auth module — Reset Token TinyDB repository.

Manages password reset tokens with expiry and one-time use enforcement.
Tokens are stored as bcrypt hashes for security; the plain token is returned
to the caller and never persisted.
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from tinydb import where

from app.db.tinydb import get_table

RESET_TOKENS_TABLE = "reset_tokens"


class ResetTokenRepository:
    """Data-access layer for password reset tokens in TinyDB."""

    def __init__(self):
        self.table = get_table(RESET_TOKENS_TABLE)

    def _hash_token(self, token: str) -> str:
        """Return a SHA-256 hash of the plain token for secure storage."""
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    def create(self, user_id: int, expiry_minutes: int = 30) -> str:
        """
        Generate a cryptographically secure reset token, store its hash with
        an expiry timestamp, and return the plain token.

        The plain token is returned to the caller (to be included in the reset
        link email). Only the hash is persisted.
        """
        plain_token = secrets.token_urlsafe(32)
        token_hash = self._hash_token(plain_token)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=expiry_minutes)

        self.table.insert({
            "user_id": user_id,
            "token_hash": token_hash,
            "expires_at": expires_at.isoformat(),
            "used": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

        return plain_token

    def find_valid(self, plain_token: str) -> dict | None:
        """
        Find a valid (unused, not expired) reset token record by its hash.

        Returns the token document or None.
        """
        token_hash = self._hash_token(plain_token)
        now = datetime.now(timezone.utc).isoformat()

        results = self.table.search(
            (where("token_hash") == token_hash)
            & (where("used") == False)
            & (where("expires_at") > now)
        )

        if not results:
            return None

        doc = results[0]
        doc["id"] = doc.doc_id
        return doc

    def mark_as_used(self, doc_id: int) -> None:
        """Mark a token as used so it cannot be reused."""
        self.table.update({"used": True}, doc_ids=[doc_id])

    def invalidate_all_for_user(self, user_id: int) -> None:
        """Mark all unused tokens for a given user as used (invalidate prior tokens)."""
        results = self.table.search(
            (where("user_id") == user_id) & (where("used") == False)
        )
        for doc in results:
            self.table.update({"used": True}, doc_ids=[doc.doc_id])