"""
HealthCore Central API — Pydantic schemas.

Data models aligned with the business entities described in CONTEXT.md.
All field values are sourced from the company briefing.
"""

from datetime import date, time
from enum import Enum
from pydantic import BaseModel, Field


# ── Enums ──

class Country(str, Enum):
    US = "US"
    GB = "GB"


class ServiceType(str, Enum):
    PRIMARY_CARE = "primary_care"
    SPECIALIST = "specialist"
    CHRONIC_DISEASE = "chronic_disease"
    PREVENTIVE = "preventive"
    WOMENS_HEALTH = "womens_health"
    MENTAL_HEALTH = "mental_health"
    PAEDIATRIC = "paediatric"


class DepartmentId(str, Enum):
    CLINICAL_OPS = "clinical-operations"
    PATIENT_ACCESS = "patient-access"
    REVENUE_CYCLE = "revenue-cycle"
    COMPLIANCE = "compliance"
    PEOPLE = "people"
    TECHNOLOGY = "technology"
    EXECUTIVE = "executive"


# ── Clinic ──

class ClinicLocation(BaseModel):
    """A HealthCore outpatient clinic location."""

    id: str = Field(description="Unique clinic identifier")
    name: str = Field(description="Clinic name")
    address: str = Field(description="Street address")
    city: str = Field(description="City")
    state: str | None = Field(None, description="State (US) or region")
    country: Country = Field(description="Country code")
    phone: str = Field(description="Phone number")
    opening_hours: str = Field(description="Opening hours string")
    services: list[ServiceType] = Field(default_factory=lambda: ["primary_care"], description="Services offered")


# ── Department ──

class DepartmentHead(BaseModel):
    name: str = Field(description="Department head name")
    title: str = Field(description="Job title")


class Department(BaseModel):
    id: DepartmentId = Field(description="Department identifier")
    name: str = Field(description="Department display name")
    head: DepartmentHead = Field(description="Department head")
    headcount: int | None = Field(None, description="Number of staff")
    kpis: dict[str, str] = Field(default_factory=dict, description="Key metrics as key-value pairs")
    description: str = Field(description="Brief description of the department's challenges")


# ── Health check ──

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
    service: str = "HealthCore Central API"