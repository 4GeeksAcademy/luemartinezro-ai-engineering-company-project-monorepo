"""
Profiles module — Pydantic schemas.

Profile holds the visible/contact data linked 1:1 to a User.
"""

from pydantic import BaseModel, Field


class ProfileCreate(BaseModel):
    """Payload for creating a Profile (usually alongside User creation)."""

    user_id: int
    name: str = Field(default="", max_length=100)
    phone: str = Field(default="", max_length=30)
    address: str = Field(default="", max_length=255)


class ProfileUpdate(BaseModel):
    """Payload for PUT /profiles/me."""

    name: str | None = Field(None, max_length=100)
    phone: str | None = Field(None, max_length=30)
    address: str | None = Field(None, max_length=255)


class ProfileResponse(BaseModel):
    """Public representation of a Profile."""

    id: int
    user_id: int
    name: str
    phone: str
    address: str

    model_config = {"from_attributes": True}