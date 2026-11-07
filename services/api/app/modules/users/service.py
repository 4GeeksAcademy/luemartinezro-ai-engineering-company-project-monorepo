"""
Users module — Business logic layer.

Coordinates user CRUD operations:
- Password hashing before storage
- Duplicate email detection
- Delegates to UserRepository for persistence
"""

from app.core.errors import conflict, not_found
from app.core.security import hash_password, verify_password
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserCreate, UserRole, UserUpdate


class UserService:
    """Business logic for User operations."""

    def __init__(self):
        self.repo = UserRepository()

    def create_user(self, payload: UserCreate) -> dict:
        """Create a new user with hashed password. Raises 409 if email exists."""
        existing = self.repo.get_by_email(payload.email)
        if existing:
            raise conflict(f"Email '{payload.email}' is already registered")

        hashed = hash_password(payload.password)
        user = self.repo.create(
            email=payload.email,
            hashed_password=hashed,
            role=payload.role.value,
        )

        # If initial profile fields were provided, create the linked profile
        if payload.name or payload.phone or payload.address:
            from app.modules.profiles.repository import ProfileRepository
            from app.modules.profiles.schemas import ProfileCreate

            profile_repo = ProfileRepository()
            profile_repo.create(
                user_id=user["id"],
                name=payload.name or "",
                phone=payload.phone or "",
                address=payload.address or "",
            )

        return user

    def get_user_by_id(self, user_id: int) -> dict:
        """Return a user by ID. Raises 404 if not found."""
        user = self.repo.get_by_id(user_id)
        if user is None:
            raise not_found(f"User '{user_id}' not found")
        return user

    def get_user_by_email(self, email: str) -> dict | None:
        """Return a user by email, or None."""
        return self.repo.get_by_email(email)

    def get_all_users(self) -> list[dict]:
        """Return all users."""
        return self.repo.get_all()

    def update_user(self, user_id: int, payload: UserUpdate) -> dict:
        """Update credential fields for a user. Raises 404 if not found."""
        user = self.repo.get_by_id(user_id)
        if user is None:
            raise not_found(f"User '{user_id}' not found")

        updates: dict = {}
        if payload.email is not None:
            # Check email uniqueness
            existing = self.repo.get_by_email(payload.email)
            if existing and existing["id"] != user_id:
                raise conflict(f"Email '{payload.email}' is already taken")
            updates["email"] = payload.email
        if payload.password is not None:
            updates["hashed_password"] = hash_password(payload.password)
        if payload.role is not None:
            updates["role"] = payload.role.value
        if payload.is_active is not None:
            updates["is_active"] = payload.is_active

        updated = self.repo.update(user_id, updates)
        return updated

    def delete_user(self, user_id: int) -> None:
        """Delete a user. Also deletes the linked profile. Raises 404 if not found."""
        user = self.repo.get_by_id(user_id)
        if user is None:
            raise not_found(f"User '{user_id}' not found")

        # Delete linked profile
        from app.modules.profiles.repository import ProfileRepository

        profile_repo = ProfileRepository()
        profile_repo.delete_by_user_id(user_id)

        self.repo.delete(user_id)

    def authenticate(self, email: str, password: str) -> dict | None:
        """
        Validate credentials. Returns the user dict on success, None on failure.
        """
        user = self.repo.get_by_email(email)
        if user is None:
            return None
        if not user.get("is_active", True):
            return None
        if not verify_password(password, user["hashed_password"]):
            return None
        return user