"""
HealthCore Central API — Incident Pydantic Schemas.

Data models for the Centralized Incident Manager.
All field names and allowed values match Company-BRIEFING.md exactly.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


# ── Enums ──


class CategoryEnum(str, Enum):
    CLINICAL_EQUIPMENT = "clinical_equipment"
    IT_SYSTEM = "it_system"
    BILLING_ERROR = "billing_error"
    COMPLIANCE_BREACH = "compliance_breach"
    PATIENT_EXPERIENCE = "patient_experience"
    STAFF_ISSUE = "staff_issue"
    FACILITY_ISSUE = "facility_issue"
    REFERRAL_ISSUE = "referral_issue"
    OTHER = "other"


class StatusEnum(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    DISCARDED = "discarded"


class OriginEnum(str, Enum):
    CUSTOMER = "customer"
    BRANCH = "branch"
    INTERNAL = "internal"


class BranchEnum(str, Enum):
    CENTRAL = "central"
    AUSTIN_NORTH = "austin_north"
    DALLAS_UPTOWN = "dallas_uptown"
    HOUSTON_MED_CENTER = "houston_med_center"
    SAN_ANTONIO_WEST = "san_antonio_west"
    MIAMI_BRICKEL = "miami_brickell"
    MIAMI_DORAL = "miami_doral"
    ORLANDO_EAST = "orlando_east"
    TAMPA_BAY = "tampa_bay"
    ATLANTA_MIDTOWN = "atlanta_midtown"
    SAVANNAH = "savannah"
    LONDON_CITY = "london_city"
    LONDON_WEST = "london_west"
    MANCHESTER_CENTRAL = "manchester_central"


# ── Request Schemas ──


class IncidentCreate(BaseModel):
    """Schema for creating a new incident."""

    title: str = Field(
        min_length=1,
        max_length=200,
        description="Brief incident title (required)",
    )
    description: str = Field(
        min_length=1,
        max_length=5000,
        description="Detailed description (required). Do NOT enter patient-identifying data.",
    )
    category: CategoryEnum = Field(description="Incident category per HealthCore BRIEFING")
    origin: OriginEnum = Field(description="Source of the report: customer, branch, or internal")
    branch: BranchEnum = Field(
        description="Branch that manages or reports the incident. "
        "Use 'central' when not specific to a clinic."
    )


class IncidentStatusUpdate(BaseModel):
    """Schema for updating only the status of an incident."""

    status: StatusEnum = Field(description="New lifecycle status for the incident")


# ── Response Schemas ──


class IncidentResponse(BaseModel):
    """Full incident representation returned by the API."""

    id: str = Field(description="Unique incident identifier")
    title: str = Field(description="Brief incident title")
    description: str = Field(description="Detailed description")
    category: str = Field(description="Incident category")
    status: str = Field(description="Current lifecycle status")
    origin: str = Field(description="Source of the report")
    branch: str = Field(description="Branch code")
    created_at: str = Field(description="Creation timestamp (ISO 8601)")
    updated_at: str = Field(description="Last modification timestamp (ISO 8601)")


class IncidentSummary(BaseModel):
    """Aggregated incident metrics returned by /summary."""

    by_status: dict[str, int] = Field(default_factory=dict)
    by_category: dict[str, int] = Field(default_factory=dict)
    by_origin: dict[str, int] = Field(default_factory=dict)
    by_branch: dict[str, int] = Field(default_factory=dict)


class ValidationErrorDetail(BaseModel):
    """A single field-level validation error."""

    field: str = Field(description="The field that failed validation")
    message: str = Field(description="Human-readable error description")


class ValidationErrorResponse(BaseModel):
    """Response body for 400 validation errors."""

    detail: list[ValidationErrorDetail] = Field(
        description="List of field-level validation errors"
    )