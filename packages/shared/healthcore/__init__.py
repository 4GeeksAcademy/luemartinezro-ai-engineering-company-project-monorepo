"""
HealthCore — Shared Validation & Domain Logic.

Reusable across the API backend, seed scripts, and any future consumers.
Defines enums, constants, validation rules, and CSV-to-model transforms
for the Centralized Incident Manager.

Usage:
    from healthcore.validation import (
        Category, Status, Origin, Branch,
        VALID_TRANSITIONS,
        validate_incident_fields,
        transform_csv_to_model,
        BRANCH_DISPLAY_LABELS,
    )
"""

from healthcore.validation import (
    Category,
    Status,
    Origin,
    Branch,
    VALID_TRANSITIONS,
    VALID_CATEGORIES,
    VALID_STATUSES,
    VALID_ORIGINS,
    VALID_BRANCHES,
    BRANCH_DISPLAY_LABELS,
    CSV_STATUS_MAP,
    CSV_CATEGORY_MAP,
    CSV_BRANCH_MAP,
    validate_incident_fields,
    validate_status_transition,
    transform_csv_to_model,
)

__all__ = [
    "Category",
    "Status",
    "Origin",
    "Branch",
    "VALID_TRANSITIONS",
    "VALID_CATEGORIES",
    "VALID_STATUSES",
    "VALID_ORIGINS",
    "VALID_BRANCHES",
    "BRANCH_DISPLAY_LABELS",
    "CSV_STATUS_MAP",
    "CSV_CATEGORY_MAP",
    "CSV_BRANCH_MAP",
    "validate_incident_fields",
    "validate_status_transition",
    "transform_csv_to_model",
]