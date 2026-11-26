"""
HealthCore Central API — Incident Management Router.

Endpoints for creating, querying, updating, and aggregating incidents.
Complements the existing analysis endpoints in ``routers/incidents.py``.

All endpoints validate input and return appropriate error responses.
Stack traces are never exposed to the client.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query
from fastapi import status as http_status

from app.db.incidents import (
    check_idempotent,
    get_incident,
    get_summary,
    insert_incident,
    list_incidents,
    update_incident_status as db_update_status,
)
from app.models.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentStatusUpdate,
    IncidentSummary,
)

from healthcore.validation import (
    validate_incident_fields,
    validate_status_transition,
)

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


# ── POST /api/incidents — Create ───────────────────────────────────────────


@router.post("", response_model=IncidentResponse, status_code=http_status.HTTP_201_CREATED)
async def create_incident(body: IncidentCreate):
    """
    Create a new incident.

    Validates all required fields. Returns 201 with the created incident
    on success, or 400 with field-level error details on validation failure.
    """
    # Validate fields using shared logic (returns dict of field → error)
    field_errors = validate_incident_fields(
        title=body.title,
        description=body.description,
        category=body.category.value if hasattr(body.category, "value") else body.category,
        origin=body.origin.value if hasattr(body.origin, "value") else body.origin,
        branch=body.branch.value if hasattr(body.branch, "value") else body.branch,
    )

    if field_errors:
        details = [
            {"field": field, "message": message}
            for field, message in field_errors.items()
        ]
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=details,
        )

    now = datetime.now(timezone.utc).isoformat()

    doc = {
        "title": body.title.strip(),
        "description": body.description.strip(),
        "category": body.category.value,
        "status": "open",  # always starts as open
        "origin": body.origin.value,
        "branch": body.branch.value,
        "created_at": now,
        "updated_at": now,
    }

    inserted = insert_incident(doc)
    return _document_to_response(inserted)


# ── GET /api/incidents — List (with filters) ───────────────────────────────


@router.get("", response_model=list[IncidentResponse])
async def list_incidents_route(
    status: str | None = Query(None, description="Filter by status"),
    origin: str | None = Query(None, description="Filter by origin"),
    branch: str | None = Query(None, description="Filter by branch"),
    category: str | None = Query(None, description="Filter by category"),
):
    """
    Return all incidents, optionally filtered.

    Filters are AND-ed together. Returns an empty list when the database
    is empty or no incidents match the filters — never an error.
    """
    results = list_incidents(
        status=status,
        origin=origin,
        branch=branch,
        category=category,
    )
    return [_document_to_response(doc) for doc in results]


# ── GET /api/incidents/{id} — Detail ────────────────────────────────────────


# ── GET /api/incidents/summary — Aggregated metrics ────────────────────────
# IMPORTANT: This MUST come before /{incident_id} so FastAPI doesn't catch
# "summary" as an incident_id.


@router.get("/summary", response_model=IncidentSummary)
async def get_incidents_summary():
    """
    Return aggregated incident metrics.

    Returns totals grouped by status, category, origin, and branch.
    When the database is empty, returns zero for all keys — never an error.
    """
    data = get_summary()
    return IncidentSummary(
        by_status=data["by_status"],
        by_category=data["by_category"],
        by_origin=data["by_origin"],
        by_branch=data["by_branch"],
    )


# ── GET /api/incidents/{id} — Detail ────────────────────────────────────────


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident_route(incident_id: str):
    """
    Return a single incident by its id.

    Returns 404 if the incident does not exist.
    """
    doc = get_incident(incident_id)
    if doc is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Incident '{incident_id}' not found.",
        )
    return _document_to_response(doc)


# ── PATCH /api/incidents/{id}/status — Update status ────────────────────────


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status_route(incident_id: str, body: IncidentStatusUpdate):
    """
    Update the lifecycle status of an incident.

    Validates the transition against the allowed lifecycle:
        open → in_progress | discarded
        in_progress → resolved | discarded
        resolved/discarded → (final, no transitions)

    Returns 400 if the transition is invalid, 404 if not found.
    """
    current = get_incident(incident_id)
    if current is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Incident '{incident_id}' not found.",
        )

    new_status = body.status.value
    current_status = current["status"]

    error = validate_status_transition(current_status, new_status)
    if error:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=[{"field": "status", "message": error}],
        )

    updated = db_update_status(incident_id, new_status)
    return _document_to_response(updated)


# ── Helper ─────────────────────────────────────────────────────────────────


def _document_to_response(doc: dict) -> dict:
    """Convert a TinyDB document dict into a response dict."""
    return {
        "id": doc.get("id", ""),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "category": doc.get("category", ""),
        "status": doc.get("status", ""),
        "origin": doc.get("origin", ""),
        "branch": doc.get("branch", ""),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }