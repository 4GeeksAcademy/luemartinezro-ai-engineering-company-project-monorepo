"""
HealthCore — Incident Analysis Service.

Reusable logic for loading, validating, and analyzing patient incident CSV files.
Used by both the CLI script (scripts/analyze.py) and the FastAPI backend.
"""

import csv
import re
import os
from typing import Any

# ── Constants ──────────────────────────────────────────────────────────────

VALID_CLINICS: dict[str, str] = {
    "US-TX-01": "US",
    "US-TX-02": "US",
    "US-TX-03": "US",
    "US-FL-01": "US",
    "US-FL-02": "US",
    "US-FL-03": "US",
    "US-GA-01": "US",
    "US-GA-02": "US",
    "US-GA-03": "US",
    "UK-LON-01": "UK",
    "UK-LON-02": "UK",
    "UK-MAN-01": "UK",
}

VALID_CATEGORIES: set[str] = {
    "APPOINTMENT",
    "BILLING",
    "CLINICAL_CARE",
    "ACCESSIBILITY",
    "ADMINISTRATIVE",
}

VALID_CATEGORIES_ORDERED: list[str] = [
    "APPOINTMENT",
    "BILLING",
    "CLINICAL_CARE",
    "ACCESSIBILITY",
    "ADMINISTRATIVE",
]

VALID_STATUSES: set[str] = {"OPEN", "CLOSED", "DISCARDED"}

VALID_STATUSES_ORDERED: list[str] = [
    "OPEN",
    "CLOSED",
    "DISCARDED",
]

PATIENT_ID_RE = re.compile(r"^PAT-\d{6}$")

# Column indices
COL_INCIDENT_ID = 1
COL_DATE = 2
COL_CLINIC_ID = 3
COL_COUNTRY = 4
COL_CATEGORY = 5
COL_DESCRIPTION = 6
COL_STATUS = 7
COL_PATIENT_ID = 8
COL_SATISFACTION_SCORE = 9


# ── Validation ─────────────────────────────────────────────────────────────

def validate_record(row: list[str]) -> list[str]:
    """
    Validate a single CSV record against all defined rules.
    Returns a list of violation descriptions (empty = valid).
    Never exposes patient_id values in violation messages.
    """
    violations: list[str] = []

    clinic_id = row[COL_CLINIC_ID].strip() if COL_CLINIC_ID < len(row) else ""
    country = row[COL_COUNTRY].strip() if COL_COUNTRY < len(row) else ""
    category = row[COL_CATEGORY].strip() if COL_CATEGORY < len(row) else ""
    description = row[COL_DESCRIPTION].strip() if COL_DESCRIPTION < len(row) else ""
    status = row[COL_STATUS].strip() if COL_STATUS < len(row) else ""
    patient_id = row[COL_PATIENT_ID].strip() if COL_PATIENT_ID < len(row) else ""
    satisfaction_raw = (
        row[COL_SATISFACTION_SCORE].strip()
        if COL_SATISFACTION_SCORE < len(row)
        else ""
    )

    # Clinic ID
    if not clinic_id or clinic_id not in VALID_CLINICS:
        violations.append("Invalid or missing clinic_id")

    # Country/clinic mismatch
    if clinic_id in VALID_CLINICS and country:
        if country != VALID_CLINICS[clinic_id]:
            violations.append("Country/clinic mismatch")

    # Category
    if not category or category not in VALID_CATEGORIES:
        violations.append("Invalid or missing category")

    # Description
    if not description or len(description) < 5:
        violations.append("Empty description")

    # Patient ID — report the rule, never the value
    if not patient_id or not PATIENT_ID_RE.match(patient_id):
        violations.append("Missing patient_id")

    # Satisfaction
    if status == "CLOSED":
        if not satisfaction_raw:
            violations.append("Closed case, no score")
        else:
            try:
                score = int(satisfaction_raw)
                if score < 1 or score > 5:
                    violations.append("satisfaction_score out of range")
            except ValueError:
                violations.append("satisfaction_score out of range")

    return violations


# ── Analysis ───────────────────────────────────────────────────────────────

def load_and_validate(filepath: str) -> tuple[list[list[str]], list[tuple[list[str], list[str]]], dict[str, int]]:
    """
    Load CSV, validate all records, and return:
      - valid_records
      - invalid_records (each with violations)
      - rule_counts
    """
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.read().split("\n")

    reader = csv.reader(lines, delimiter="\t")
    rows = list(reader)

    # Header row is rows[0]; skip it to get data
    data_rows = rows[1:] if len(rows) > 1 else []
    data_rows = [r for r in data_rows if any(cell.strip() for cell in r)]

    valid_records: list[list[str]] = []
    invalid_records: list[tuple[list[str], list[str]]] = []

    rule_counts: dict[str, int] = {
        "Invalid or missing clinic_id": 0,
        "Country/clinic mismatch": 0,
        "Invalid or missing category": 0,
        "Empty description": 0,
        "Missing patient_id": 0,
        "Closed case, no score": 0,
        "satisfaction_score out of range": 0,
    }

    for row in data_rows:
        # Ensure row has enough columns
        while len(row) <= COL_SATISFACTION_SCORE:
            row.append("")

        violations = validate_record(row)
        if violations:
            invalid_records.append((row, violations))
            for v in violations:
                if v in rule_counts:
                    rule_counts[v] += 1
        else:
            valid_records.append(row)

    return valid_records, invalid_records, rule_counts


def compute_metrics(
    valid_records: list[list[str]],
    invalid_records: list[tuple[list[str], list[str]]],
    rule_counts: dict[str, int],
    total: int,
    filepath: str = "",
) -> dict[str, Any]:
    """Compute all summary metrics from validated records."""

    # Category breakdown
    category_counts: dict[str, int] = {c: 0 for c in VALID_CATEGORIES}
    for row in valid_records:
        cat = row[COL_CATEGORY].strip()
        if cat in category_counts:
            category_counts[cat] += 1

    # Status breakdown
    status_counts: dict[str, int] = {s: 0 for s in VALID_STATUSES}
    for row in valid_records:
        st = row[COL_STATUS].strip()
        if st in status_counts:
            status_counts[st] += 1

    # Country breakdown
    country_counts: dict[str, int] = {}
    for row in valid_records:
        cntry = row[COL_COUNTRY].strip()
        country_counts[cntry] = country_counts.get(cntry, 0) + 1

    # Satisfaction analysis
    satisfaction_scores: list[int] = []
    satisfaction_distribution: dict[int, int] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for row in valid_records:
        if row[COL_STATUS].strip() == "CLOSED":
            score_raw = (
                row[COL_SATISFACTION_SCORE].strip()
                if COL_SATISFACTION_SCORE < len(row)
                else ""
            )
            if score_raw:
                try:
                    score = int(score_raw)
                    if 1 <= score <= 5:
                        satisfaction_scores.append(score)
                        satisfaction_distribution[score] = (
                            satisfaction_distribution.get(score, 0) + 1
                        )
                except ValueError:
                    pass

    avg_satisfaction = 0.0
    if satisfaction_scores:
        avg_satisfaction = round(sum(satisfaction_scores) / len(satisfaction_scores), 2)

    return {
        "filepath": os.path.basename(filepath) if filepath else "",
        "total": total,
        "valid_count": len(valid_records),
        "invalid_count": len(invalid_records),
        "rule_counts": rule_counts,
        "category_counts": category_counts,
        "status_counts": status_counts,
        "country_counts": country_counts,
        "satisfaction_scores": satisfaction_scores,
        "satisfaction_distribution": satisfaction_distribution,
        "avg_satisfaction": avg_satisfaction,
    }


def analyze(filepath: str) -> dict[str, Any]:
    """Full pipeline: load → validate → compute metrics."""
    valid_records, invalid_records, rule_counts = load_and_validate(filepath)
    total = len(valid_records) + len(invalid_records)
    return compute_metrics(valid_records, invalid_records, rule_counts, total, filepath)