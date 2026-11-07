"""
HealthCore — Supplier Management Router.

FastAPI endpoints for managing the supplier directory.
Uses TinyDB for persistence and Pydantic for validation.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from tinydb import Query as TQuery

from app.database import suppliers_table, is_empty, SupplierQuery
from app.models.suppliers import (
    VALID_CATEGORIES,
    VALID_STATUSES,
    SupplierCategory,
    SupplierCreate,
    SupplierDocument,
    SupplierResponse,
    RateUpdate,
    StatusUpdate,
)

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


# ── Helpers ──


def _doc_to_response(doc_id: int, doc: dict) -> SupplierResponse:
    """Convert a TinyDB document dict to a SupplierResponse."""
    return SupplierResponse(
        id=doc_id,
        name=doc.get("name", ""),
        country=doc.get("country", ""),
        categories=doc.get("categories", []),
        rate=doc.get("rate", 0.0),
        status=doc.get("status", ""),
        updated_at=doc.get("updated_at", ""),
    )


def _get_supplier_or_404(doc_id: int) -> tuple[int, dict]:
    """
    Retrieve a supplier by TinyDB doc_id.
    Returns (doc_id, document_dict) or raises 404.
    """
    doc = suppliers_table.get(doc_id=doc_id)
    if doc is None:
        raise HTTPException(
            status_code=404,
            detail=f"Supplier with ID '{doc_id}' not found.",
        )
    return doc_id, doc


# ── Endpoints ──


@router.post("", response_model=SupplierResponse, status_code=201)
async def create_supplier(data: SupplierCreate):
    """
    Register a new supplier.

    Validates input via Pydantic, creates the document, and returns
    the created supplier with its TinyDB-assigned ID.
    """
    doc = SupplierDocument.from_create(data)
    doc_id = suppliers_table.insert(doc.model_dump())
    return _doc_to_response(doc_id, doc.model_dump())


@router.get("", response_model=list[SupplierResponse])
async def list_suppliers(
    country: Optional[str] = Query(None, description="Filter by country (US or UK)"),
    category: Optional[str] = Query(None, description="Filter by product category"),
):
    """
    List all suppliers, optionally filtered by country and/or category.

    If no filter parameters are provided, returns the full directory.
    """
    # Build a query dynamically
    query_parts = []

    if country is not None:
        if country not in ("US", "UK"):
            raise HTTPException(
                status_code=400,
                detail="Country filter must be 'US' or 'UK'.",
            )
        query_parts.append(SupplierQuery.country == country)

    if category is not None:
        if category not in VALID_CATEGORIES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category '{category}'. Valid: {', '.join(VALID_CATEGORIES)}",
            )
        # Check if the category is in the categories array
        query_parts.append(SupplierQuery.categories.any([category]))

    # Apply filters or return all
    if query_parts:
        combined = query_parts[0]
        for part in query_parts[1:]:
            combined = combined & part
        results = suppliers_table.search(combined)
    else:
        results = suppliers_table.all()

    return [_doc_to_response(doc.doc_id, doc) for doc in results]


@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(supplier_id: int):
    """
    Return the detail of a supplier by its TinyDB document ID.
    """
    _, doc = _get_supplier_or_404(supplier_id)
    return _doc_to_response(supplier_id, doc)


@router.patch("/{supplier_id}/rate", response_model=SupplierResponse)
async def update_supplier_rate(supplier_id: int, data: RateUpdate):
    """
    Update a supplier's contracted rate.

    Automatically records the updated_at timestamp.
    Rejects zero or negative values.
    """
    _, doc = _get_supplier_or_404(supplier_id)

    now = datetime.now(timezone.utc).isoformat()
    suppliers_table.update(
        {"rate": data.rate, "updated_at": now},
        doc_ids=[supplier_id],
    )

    _, updated_doc = _get_supplier_or_404(supplier_id)
    return _doc_to_response(supplier_id, updated_doc)


@router.patch("/{supplier_id}/status", response_model=SupplierResponse)
async def update_supplier_status(supplier_id: int, data: StatusUpdate):
    """
    Activate or suspend a supplier.

    Accepts only 'active' or 'suspended' as valid status values.
    """
    _, doc = _get_supplier_or_404(supplier_id)

    now = datetime.now(timezone.utc).isoformat()
    suppliers_table.update(
        {"status": data.status.value, "updated_at": now},
        doc_ids=[supplier_id],
    )

    _, updated_doc = _get_supplier_or_404(supplier_id)
    return _doc_to_response(supplier_id, updated_doc)


@router.delete("/{supplier_id}", status_code=204)
async def delete_supplier(supplier_id: int):
    """
    Remove a supplier from the directory.

    Returns 204 on success, 404 if the supplier does not exist.
    """
    # Verify exists
    _get_supplier_or_404(supplier_id)

    suppliers_table.remove(doc_ids=[supplier_id])
    return None