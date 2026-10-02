"""Departments router — HealthCore department and KPI endpoints."""

from fastapi import APIRouter, HTTPException

from app.data import DEPARTMENTS
from app.models.schemas import Department, DepartmentId

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("", response_model=list[Department])
async def list_departments():
    """Return all HealthCore departments."""
    return list(DEPARTMENTS.values())


@router.get("/{department_id}", response_model=Department)
async def get_department(department_id: DepartmentId):
    """Return a single department by its ID."""
    dept = DEPARTMENTS.get(department_id)
    if dept is None:
        raise HTTPException(status_code=404, detail=f"Department '{department_id}' not found")
    return dept


@router.get("/{department_id}/kpis", response_model=dict[str, str])
async def get_department_kpis(department_id: DepartmentId):
    """Return the KPIs for a specific department."""
    dept = DEPARTMENTS.get(department_id)
    if dept is None:
        raise HTTPException(status_code=404, detail=f"Department '{department_id}' not found")
    return dept.kpis