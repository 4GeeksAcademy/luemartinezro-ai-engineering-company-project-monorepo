"""
HealthCore — Incident TinyDB Repository.

CRUD operations for the incidents table, plus aggregation queries.
All operations use the TinyDB instance shared via ``app.db.tinydb.get_db()``.
"""

from __future__ import annotations

from tinydb import Query
from tinydb.table import Document

from app.core.settings import settings
from app.db.tinydb import get_table


# ── Table access ───────────────────────────────────────────────────────────

_INCIDENTS_TABLE_NAME = "incidents"


def _table():
    """Return the incidents TinyDB table."""
    return get_table(_INCIDENTS_TABLE_NAME)


IncidentQuery = Query()


# ── Helpers ────────────────────────────────────────────────────────────────

def _next_id() -> str:
    """Generate a simple incrementing string ID (INC-00001, INC-00002, …)."""
    table = _table()
    all_docs = table.all()
    if not all_docs:
        return "INC-00001"
    # Extract numeric parts from existing IDs
    max_num = 0
    for doc in all_docs:
        doc_id = doc.get("id", "")
        if doc_id.startswith("INC-"):
            try:
                num = int(doc_id.split("-")[1])
                max_num = max(max_num, num)
            except (ValueError, IndexError):
                pass
    return f"INC-{max_num + 1:05d}"


# ── CRUD ───────────────────────────────────────────────────────────────────


def insert_incident(incident: dict) -> dict:
    """
    Insert a new incident document.

    The ``incident`` dict must contain all required fields. The ``id``,
    ``created_at`` and ``updated_at`` fields are set here if not provided.

    Returns the inserted document with its generated id.
    """
    doc = dict(incident)
    doc["id"] = _next_id()
    doc["created_at"] = doc.get("created_at", "")
    doc["updated_at"] = doc.get("updated_at", "")

    # Store the doc in TinyDB
    _table().insert(doc)
    return doc


def get_incident(incident_id: str) -> dict | None:
    """Return a single incident by its string id, or None if not found."""
    results = _table().search(IncidentQuery.id == incident_id)
    if results:
        return results[0]
    return None


def list_incidents(
    status: str | None = None,
    origin: str | None = None,
    branch: str | None = None,
    category: str | None = None,
) -> list[dict]:
    """
    Return incidents, optionally filtered.

    Multiple filters are AND-ed together. Returns all incidents when
    no filters are provided. Returns an empty list when the DB is empty.
    """
    query = IncidentQuery  # shorthand

    # Start with a condition that always matches
    conditions = []

    if status:
        conditions.append(query.status == status)
    if origin:
        conditions.append(query.origin == origin)
    if branch:
        conditions.append(query.branch == branch)
    if category:
        conditions.append(query.category == category)

    if conditions:
        # Combine all conditions with AND
        combined = conditions[0]
        for cond in conditions[1:]:
            combined = combined & cond
        results = _table().search(combined)
    else:
        results = _table().all()

    return results


def update_incident_status(incident_id: str, new_status: str) -> dict | None:
    """
    Update the status of an incident.

    Returns the updated document, or None if the incident does not exist.
    Does NOT validate the transition — that is the caller's responsibility.
    """
    doc = get_incident(incident_id)
    if doc is None:
        return None

    from datetime import datetime, timezone
    doc["status"] = new_status
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()

    _table().update(doc, IncidentQuery.id == incident_id)
    return doc


def check_idempotent(incident_id: str) -> bool:
    """
    Check if a CSV incident_id has already been imported.

    Returns True if a record with the given ``_csv_incident_id`` exists.
    """
    results = _table().search(IncidentQuery._csv_incident_id == incident_id)
    return len(results) > 0


# ── Summary / Aggregation ──────────────────────────────────────────────────


def get_summary() -> dict:
    """
    Return aggregated metrics across all incidents.

    Returns a dict with:
        by_status:  dict[str, int]
        by_category: dict[str, int]
        by_origin:   dict[str, int]
        by_branch:   dict[str, int]

    All entries are zero-initialised so the response is deterministic
    even when the database is empty.
    """
    all_incidents = _table().all()

    # Initialise with all valid values
    from healthcore.validation import (
        VALID_CATEGORIES,
        VALID_STATUSES,
        VALID_ORIGINS,
        VALID_BRANCHES,
    )

    by_status: dict[str, int] = {s: 0 for s in sorted(VALID_STATUSES)}
    by_category: dict[str, int] = {c: 0 for c in sorted(VALID_CATEGORIES)}
    by_origin: dict[str, int] = {o: 0 for o in sorted(VALID_ORIGINS)}
    by_branch: dict[str, int] = {b: 0 for b in sorted(VALID_BRANCHES)}

    for doc in all_incidents:
        s = doc.get("status")
        if s in by_status:
            by_status[s] += 1

        c = doc.get("category")
        if c in by_category:
            by_category[c] += 1

        o = doc.get("origin")
        if o in by_origin:
            by_origin[o] += 1

        b = doc.get("branch")
        if b in by_branch:
            by_branch[b] += 1

    return {
        "by_status": by_status,
        "by_category": by_category,
        "by_origin": by_origin,
        "by_branch": by_branch,
    }