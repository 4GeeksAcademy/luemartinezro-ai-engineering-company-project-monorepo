"""
HealthCore — Supplier Management Models.

Pydantic schemas for supplier directory management.
Aligned with HealthCore's healthcare procurement context.
"""

from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, Field, field_validator
from typing import Optional


# ── Enums ──


class SupplierCategory(str, Enum):
    """Valid product/service categories for HealthCore suppliers."""

    MEDICAL_SUPPLIES = "MEDICAL_SUPPLIES"
    PHARMACEUTICALS = "PHARMACEUTICALS"
    MEDICAL_EQUIPMENT = "MEDICAL_EQUIPMENT"
    IT_SERVICES = "IT_SERVICES"
    ADMINISTRATIVE = "ADMINISTRATIVE"


VALID_CATEGORIES: list[str] = [c.value for c in SupplierCategory]


class SupplierStatus(str, Enum):
    """A supplier can be either active or suspended."""

    ACTIVE = "active"
    SUSPENDED = "suspended"


VALID_STATUSES: list[str] = [s.value for s in SupplierStatus]


# ── Input / Create model ──


class SupplierCreate(BaseModel):
    """Fields required to register a new supplier."""

    name: str = Field(
        ..., min_length=2, max_length=200, description="Supplier company name"
    )
    country: str = Field(
        ..., description="Country code: US or UK"
    )
    categories: list[SupplierCategory] = Field(
        ..., min_length=1, description="Product or service categories"
    )
    rate: float = Field(
        ..., gt=0, description="Current contracted rate (must be positive)"
    )
    status: SupplierStatus = Field(
        default=SupplierStatus.ACTIVE, description="Supplier status"
    )

    @field_validator("country")
    @classmethod
    def validate_country(cls, v: str) -> str:
        if v not in ("US", "UK"):
            raise ValueError("Country must be 'US' or 'UK'")
        return v

    @field_validator("rate")
    @classmethod
    def validate_rate(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Rate must be a positive number")
        return round(v, 2)


# ── Response model ──


class SupplierResponse(BaseModel):
    """Supplier data returned by the API, including system-managed fields."""

    id: int = Field(..., description="TinyDB document ID")
    name: str = Field(..., description="Supplier company name")
    country: str = Field(..., description="Country code: US or UK")
    categories: list[str] = Field(..., description="Product or service categories")
    rate: float = Field(..., description="Current contracted rate")
    status: str = Field(..., description="Supplier status (active/suspended)")
    updated_at: str = Field(..., description="ISO 8601 timestamp of last update")


# ── Internal document model (what goes into TinyDB) ──


class SupplierDocument(BaseModel):
    """Internal shape stored in TinyDB (all fields populated)."""

    name: str
    country: str
    categories: list[str]
    rate: float
    status: str
    updated_at: str

    @classmethod
    def from_create(cls, data: SupplierCreate) -> "SupplierDocument":
        """Build a document from a creation request, setting system fields."""
        return cls(
            name=data.name,
            country=data.country,
            categories=[c.value for c in data.categories],
            rate=data.rate,
            status=data.status.value,
            updated_at=datetime.now(timezone.utc).isoformat(),
        )

    def to_response(self, doc_id: int) -> SupplierResponse:
        """Convert to the API response shape."""
        return SupplierResponse(
            id=doc_id,
            name=self.name,
            country=self.country,
            categories=self.categories,
            rate=self.rate,
            status=self.status,
            updated_at=self.updated_at,
        )


# ── Update models ──


class RateUpdate(BaseModel):
    """Request body for updating a supplier's rate."""

    rate: float = Field(..., gt=0, description="New rate (must be positive)")

    @field_validator("rate")
    @classmethod
    def validate_rate(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Rate must be a positive number")
        return round(v, 2)


class StatusUpdate(BaseModel):
    """Request body for updating a supplier's status."""

    status: SupplierStatus = Field(..., description="New status: active or suspended")