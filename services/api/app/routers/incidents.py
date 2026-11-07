"""
Incident analysis router — FastAPI endpoints.

POST /api/incidents/analyze   — upload CSV, run analysis, return JSON summary.
GET  /api/incidents/results/export — download last analysis as CSV.
"""

import csv
import io
import os
import tempfile
from typing import Optional

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse

from app.analyzer import load_and_validate, compute_metrics

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

# In-memory cache for last analysis result
_last_result: Optional[dict] = None


def _build_response(result: dict) -> dict:
    """Convert analyzer result dict to structured API response."""
    rule = result["rule_counts"]
    sat_dist = result["satisfaction_distribution"]

    return {
        "filename": result.get("filepath", ""),
        "total_records": result["total"],
        "valid_records": result["valid_count"],
        "invalid_records": result["invalid_count"],
        "rule_counts": {
            "invalid_or_missing_clinic_id": rule.get("Invalid or missing clinic_id", 0),
            "country_clinic_mismatch": rule.get("Country/clinic mismatch", 0),
            "invalid_or_missing_category": rule.get("Invalid or missing category", 0),
            "empty_description": rule.get("Empty description", 0),
            "missing_patient_id": rule.get("Missing patient_id", 0),
            "closed_case_no_score": rule.get("Closed case, no score", 0),
            "satisfaction_score_out_of_range": rule.get("satisfaction_score out of range", 0),
        },
        "category_counts": result["category_counts"],
        "status_counts": result["status_counts"],
        "country_counts": result["country_counts"],
        "scored_cases": len(result["satisfaction_scores"]),
        "average_satisfaction": result["avg_satisfaction"],
        "satisfaction_distribution": {
            "score_1": sat_dist.get(1, 0),
            "score_2": sat_dist.get(2, 0),
            "score_3": sat_dist.get(3, 0),
            "score_4": sat_dist.get(4, 0),
            "score_5": sat_dist.get(5, 0),
        },
    }


@router.post("/analyze")
async def analyze_incidents(file: UploadFile = File(...)):
    """
    Upload a CSV file of patient incidents and return analysis summary.

    The file may be comma-, tab- or whitespace-separated. The delimiter is
    detected automatically and columns are mapped by header name, so the
    standard HealthCore schema is validated regardless of the separator.
    """
    global _last_result

    # Validate file presence
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    # Validate extension
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV.")

    # Read uploaded content
    content = await file.read()
    if not content or len(content.strip()) == 0:
        raise HTTPException(status_code=400, detail="File is empty.")

    # Write to a temporary file for the analyzer
    suffix = os.path.splitext(file.filename)[1] or ".csv"
    with tempfile.NamedTemporaryFile(mode="wb", suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        valid_records, invalid_records, rule_counts = load_and_validate(tmp_path)
        total = len(valid_records) + len(invalid_records)
        result = compute_metrics(
            valid_records, invalid_records, rule_counts, total, file.filename
        )
        _last_result = result
        return _build_response(result)
    except ValueError as exc:
        # Unparseable / wrong-format file → descriptive 400, not a 500.
        raise HTTPException(status_code=400, detail=str(exc))
    finally:
        os.unlink(tmp_path)


@router.get("/results/export")
async def export_results():
    """
    Download the last analysis results as a CSV file.
    """
    global _last_result

    if _last_result is None:
        raise HTTPException(
            status_code=400,
            detail="No analysis results available. Run an analysis first.",
        )

    result = _last_result
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["metric", "value", "percentage"])

    # Helper
    def pct(v: int, t: int) -> str:
        if t == 0:
            return "0.0%"
        return f"{(v / t) * 100:.1f}%"

    total = result["total"]

    # Totals
    writer.writerow(["total_records", str(total), ""])
    writer.writerow(["valid_records", str(result["valid_count"]), pct(result["valid_count"], total)])
    writer.writerow(["invalid_records", str(result["invalid_count"]), pct(result["invalid_count"], total)])

    # Invalid breakdown
    for rule, count in sorted(result["rule_counts"].items()):
        metric = f"invalid_{rule.lower().replace(' ', '_')}"
        writer.writerow([metric, str(count), ""])

    # Category
    cat_total = sum(result["category_counts"].values())
    for cat, cnt in sorted(result["category_counts"].items()):
        writer.writerow([f"category_{cat.lower()}", str(cnt), pct(cnt, cat_total)])

    # Status
    status_total = sum(result["status_counts"].values())
    for st, cnt in sorted(result["status_counts"].items()):
        writer.writerow([f"status_{st.lower()}", str(cnt), pct(cnt, status_total)])

    # Country
    country_total = sum(result["country_counts"].values())
    for cntry, cnt in sorted(result["country_counts"].items()):
        writer.writerow([f"country_{cntry.lower()}", str(cnt), pct(cnt, country_total)])

    # Satisfaction
    closed_total = len(result["satisfaction_scores"])
    writer.writerow(["closed_scored_cases", str(closed_total), ""])
    writer.writerow(["average_satisfaction", f"{result['avg_satisfaction']:.2f}", "/ 5.00"])
    for score in range(1, 6):
        cnt = result["satisfaction_distribution"].get(score, 0)
        writer.writerow([f"satisfaction_score_{score}", str(cnt), ""])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=incident-analysis-results.csv"
        },
    )