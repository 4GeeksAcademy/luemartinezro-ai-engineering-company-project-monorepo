"""
Users module — Pydantic schemas.

User stores only credentials: email and hashed_password.
Visible/contact data lives in the Profile model.
"""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRole(str, Enum):
    """Allowed roles for a HealthCore user."""

    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"


# ── Request schemas ──


class UserCreate(BaseModel):
    """Payload for POST /users — create a new user."""

    email: EmailStr
    password: str = Field(..., min_length=6, description="Plain-text password (will be hashed)")
    role: UserRole = UserRole.USER

    # Optional initial profile fields
    name: str | None = Field(None, max_length=100, description="Display name (saved in Profile)")
    phone: str | None = Field(None, max_length=30, description="Contact phone (saved in Profile)")
    address: str | None = Field(None, max_length=255, description="Street address (saved in Profile)")


class UserUpdate(BaseModel):
    """Payload for PUT /users/{id} — update credential fields."""

    email: EmailStr | None = None
    password: str | None = Field(None, min_length=6)
    role: UserRole | None = None
    is_active: bool | None = None


# ── Response schemas ──


class UserResponse(BaseModel):
    """Public representation of a User (never expose hashed_password)."""

    id: int
    email: str
    role: UserRole
    is_active: bool
    created_at: str

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    """Wrapper for paginated or full user list."""

    users: list[UserResponse]
    total: int