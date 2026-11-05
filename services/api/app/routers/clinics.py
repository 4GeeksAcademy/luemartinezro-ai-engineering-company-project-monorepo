"""Clinics router — HealthCore clinic endpoints."""

from fastapi import APIRouter, HTTPException

from app.data import CLINICS
from app.models.schemas import ClinicLocation, Country

router = APIRouter(prefix="/clinics", tags=["clinics"])


@router.get("", response_model=list[ClinicLocation])
async def list_clinics():
    """Return all HealthCore clinics."""
    return CLINICS


@router.get("/{clinic_id}", response_model=ClinicLocation)
async def get_clinic(clinic_id: str):
    """Return a single clinic by its ID."""
    for clinic in CLINICS:
        if clinic.id == clinic_id:
            return clinic
    raise HTTPException(status_code=404, detail=f"Clinic '{clinic_id}' not found")


@router.get("/country/{country}", response_model=list[ClinicLocation])
async def list_clinics_by_country(country: Country):
    """Return clinics filtered by country (US or GB)."""
    return [c for c in CLINICS if c.country == country]