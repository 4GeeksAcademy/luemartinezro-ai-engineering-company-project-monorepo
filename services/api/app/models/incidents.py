"""
Incident analysis schemas for the HealthCore API.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class RuleCount(BaseModel):
    invalid_or_missing_clinic_id: int = 0
    country_clinic_mismatch: int = 0
    invalid_or_missing_category: int = 0
    empty_description: int = 0
    missing_patient_id: int = 0
    closed_case_no_score: int = 0
    satisfaction_score_out_of_range: int = 0


class CategoryCount(BaseModel):
    APPOINTMENT: int = 0
    BILLING: int = 0
    CLINICAL_CARE: int = 0
    ACCESSIBILITY: int = 0
    ADMINISTRATIVE: int = 0


class StatusCount(BaseModel):
    OPEN: int = 0
    CLOSED: int = 0
    DISCARDED: int = 0


class SatisfactionDistribution(BaseModel):
    score_1: int = 0
    score_2: int = 0
    score_3: int = 0
    score_4: int = 0
    score_5: int = 0


class IncidentAnalysisResponse(BaseModel):
    filename: str = ""
    total_records: int = 0
    valid_records: int = 0
    invalid_records: int = 0
    rule_counts: RuleCount = Field(default_factory=RuleCount)
    category_counts: dict[str, int] = Field(default_factory=dict)
    status_counts: dict[str, int] = Field(default_factory=dict)
    country_counts: dict[str, int] = Field(default_factory=dict)
    scored_cases: int = 0
    average_satisfaction: float = 0.0
    satisfaction_distribution: SatisfactionDistribution = Field(
        default_factory=SatisfactionDistribution
    )


class ErrorResponse(BaseModel):
    detail: str