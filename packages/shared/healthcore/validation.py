"""
HealthCore — Incident Validation & Domain Logic.

Centralized definitions for the Incident Manager domain:
- Enums for category, status, origin, and branch (aligned with Company-BRIEFING.md)
- Valid transitions per the lifecycle specification
- Validation functions for incident fields
- CSV-to-model transformation logic for the historical seed script

All field names, values, and mappings match the HealthCore BRIEFING exactly.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from enum import Enum
from typing import Any


# ── Enums ──────────────────────────────────────────────────────────────────


class Category(str, Enum):
    """Incident categories as defined in the HealthCore BRIEFING."""

    CLINICAL_EQUIPMENT = "clinical_equipment"
    IT_SYSTEM = "it_system"
    BILLING_ERROR = "billing_error"
    COMPLIANCE_BREACH = "compliance_breach"
    PATIENT_EXPERIENCE = "patient_experience"
    STAFF_ISSUE = "staff_issue"
    FACILITY_ISSUE = "facility_issue"
    REFERRAL_ISSUE = "referral_issue"
    OTHER = "other"


class Status(str, Enum):
    """Lifecycle states for an incident."""

    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    DISCARDED = "discarded"


class Origin(str, Enum):
    """Source of the incident report."""

    CUSTOMER = "customer"
    BRANCH = "branch"
    INTERNAL = "internal"


class Branch(str, Enum):
    """HealthCore clinic branches — operations reporting units."""

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


# ── Enum value sets ────────────────────────────────────────────────────────

VALID_CATEGORIES: set[str] = {c.value for c in Category}
VALID_STATUSES: set[str] = {s.value for s in Status}
VALID_ORIGINS: set[str] = {o.value for o in Origin}
VALID_BRANCHES: set[str] = {b.value for b in Branch}


# ── Display labels (matching BRIEFING display names) ───────────────────────

BRANCH_DISPLAY_LABELS: dict[str, str] = {
    "central": "Central — Austin Main Clinic",
    "austin_north": "Austin — North",
    "dallas_uptown": "Dallas Uptown",
    "houston_med_center": "Houston Medical Center",
    "san_antonio_west": "San Antonio West",
    "miami_brickell": "Miami Brickell",
    "miami_doral": "Miami Doral",
    "orlando_east": "Orlando East",
    "tampa_bay": "Tampa Bay",
    "atlanta_midtown": "Atlanta Midtown",
    "savannah": "Savannah",
    "london_city": "London City",
    "london_west": "London West End",
    "manchester_central": "Manchester Central",
}


# ── Status Lifecycle Transitions ───────────────────────────────────────────

# Maps current status → set of allowed next statuses.
# `resolved` and `discarded` are final states (no outgoing transitions).
VALID_TRANSITIONS: dict[str, set[str]] = {
    "open": {"in_progress", "discarded"},
    "in_progress": {"resolved", "discarded"},
    "resolved": set(),
    "discarded": set(),
}


# ── CSV-to-Model Mappings (from BRIEFING) ──────────────────────────────────

CSV_STATUS_MAP: dict[str, str] = {
    "OPEN": "open",
    "CLOSED": "resolved",
    "DISCARDED": "discarded",
}

CSV_CATEGORY_MAP: dict[str, str] = {
    "APPOINTMENT": "patient_experience",
    "BILLING": "billing_error",
    "CLINICAL_CARE": "patient_experience",
    "ACCESSIBILITY": "patient_experience",
    "ADMINISTRATIVE": "other",
}

CSV_BRANCH_MAP: dict[str, str] = {
    "US-TX-01": "central",
    "US-TX-02": "austin_north",
    "US-TX-03": "houston_med_center",
    "US-FL-01": "miami_brickell",
    "US-FL-02": "orlando_east",
    "US-FL-03": "tampa_bay",
    "US-GA-01": "atlanta_midtown",
    "US-GA-02": "atlanta_midtown",
    "US-GA-03": "savannah",
    "UK-LON-01": "london_city",
    "UK-LON-02": "london_west",
    "UK-MAN-01": "manchester_central",
}

# Valid clinic IDs (from the analyzer, reused here)
VALID_CLINIC_IDS: set[str] = set(CSV_BRANCH_MAP.keys())


# ── Validation Functions ───────────────────────────────────────────────────


def validate_incident_fields(
    *,
    title: str | None,
    description: str | None,
    category: str | None,
    origin: str | None,
    branch: str | None,
) -> dict[str, str]:
    """
    Validate incident creation/update fields.

    Returns a dict of ``field_name → error_message``. An empty dict means
    all fields are valid.

    This never inspects or exposes patient-identifiable data. Users see
    a general warning not to enter identifying patient information.
    """
    errors: dict[str, str] = {}

    # ── Title ──
    if not title or not title.strip():
        errors["title"] = "Title is required."
    elif len(title.strip()) > 200:
        errors["title"] = "Title must be 200 characters or fewer."

    # ── Description ──
    if not description or not description.strip():
        errors["description"] = "Description is required."
    elif len(description.strip()) > 5000:
        errors["description"] = "Description must be 5000 characters or fewer."

    # ── Category ──
    if not category:
        errors["category"] = "Category is required."
    elif category not in VALID_CATEGORIES:
        valid_list = ", ".join(sorted(VALID_CATEGORIES))
        errors["category"] = f"Invalid category. Must be one of: {valid_list}"

    # ── Origin ──
    if not origin:
        errors["origin"] = "Origin is required."
    elif origin not in VALID_ORIGINS:
        valid_list = ", ".join(sorted(VALID_ORIGINS))
        errors["origin"] = f"Invalid origin. Must be one of: {valid_list}"

    # ── Branch ──
    if not branch:
        errors["branch"] = "Branch is required."
    elif branch not in VALID_BRANCHES:
        valid_list = ", ".join(sorted(VALID_BRANCHES))
        errors["branch"] = f"Invalid branch. Must be one of: {valid_list}"

    return errors


def validate_status_transition(current_status: str, new_status: str) -> str | None:
    """
    Validate a status transition against the lifecycle rules.

    Returns an error message string if the transition is invalid,
    or ``None`` if the transition is allowed.
    """
    if current_status not in VALID_TRANSITIONS:
        return f"Unknown current status: '{current_status}'."

    allowed = VALID_TRANSITIONS[current_status]
    if new_status not in allowed:
        if current_status in ("resolved", "discarded"):
            return (
                f"Incident is already '{current_status}' — this is a final state "
                f"and cannot be changed."
            )
        return (
            f"Cannot transition from '{current_status}' to '{new_status}'. "
            f"Allowed transitions: {', '.join(sorted(allowed)) or 'none'}"
        )

    return None


# ── CSV Transformation ────────────────────────────────────────────────────


def transform_csv_to_model(row: dict[str, str]) -> dict[str, Any] | None:
    """
    Transform a parsed CSV row (dict with header keys) into a model-compatible
    dict ready for insertion.

    Returns ``None`` if the row cannot be mapped (missing required fields,
    unrecognised values). Invalid rows are reported to the caller, which
    should log them to the console.

    Implements the mapping tables defined in Company-BRIEFING.md.
    """
    incident_id = (row.get("incident_id") or "").strip()
    raw_description = (row.get("description") or "").strip()
    raw_date = (row.get("date") or "").strip()
    clinic_id = (row.get("clinic_id") or "").strip()
    raw_status = (row.get("status") or "").strip().upper()
    raw_category = (row.get("category") or "").strip().upper()

    # --- Validate / transform each field ---

    # Title: first 120 chars of description, trimmed
    if not raw_description:
        return None  # discard row
    title = raw_description[:120].strip()
    if not title:
        return None

    description = raw_description  # verbatim

    # Status mapping
    status = CSV_STATUS_MAP.get(raw_status)
    if not status:
        return None

    # Category mapping
    category = CSV_CATEGORY_MAP.get(raw_category)
    if not category:
        return None

    # Branch mapping
    branch = CSV_BRANCH_MAP.get(clinic_id, "central")

    # Date parsing
    created_at: str | None = None
    updated_at: str | None = None
    if raw_date:
        try:
            dt = datetime.strptime(raw_date, "%Y-%m-%d")
            created_at = dt.replace(tzinfo=timezone.utc).isoformat()
            updated_at = created_at
        except ValueError:
            created_at = datetime.now(timezone.utc).isoformat()
            updated_at = created_at
    else:
        now = datetime.now(timezone.utc)
        created_at = now.isoformat()
        updated_at = created_at

    return {
        "_csv_incident_id": incident_id,  # used for idempotency, not stored in model
        "title": title,
        "description": description,
        "category": category,
        "status": status,
        "origin": "customer",  # all seed records are customer-origin
        "branch": branch,
        "created_at": created_at,
        "updated_at": updated_at,
    }