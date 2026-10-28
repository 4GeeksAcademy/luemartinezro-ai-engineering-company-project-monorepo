#!/usr/bin/env python3
"""
HealthCore — Patient Incident Report Analyzer (CLI)

Usage:
    python analyze.py incidents-healthcore.csv

Reads a CSV of patient incidents (comma-, tab- or whitespace-separated;
the delimiter is detected automatically), validates records, computes
summary metrics, prints a formatted report, and optionally exports to CSV.

Complies with HIPAA / UK GDPR — patient_id is NEVER printed or exported.

Reuses shared analysis logic from services/api/app/analyzer.py.
"""

import csv
import os
import sys

# Import shared analysis logic from the service layer
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "services", "api"))
from app.analyzer import (
    VALID_CATEGORIES_ORDERED,
    VALID_STATUSES_ORDERED,
    analyze,
)


# ── Output formatting ──────────────────────────────────────────────────────

def pct(value: int, total: int) -> str:
    """Format percentage with 1 decimal place."""
    if total == 0:
        return "0.0%"
    return f"{(value / total) * 100:.1f}%"


def print_report(result: dict) -> None:
    """Print the formatted analysis report to stdout."""
    filepath = result["filepath"]
    total = result["total"]
    valid = result["valid_count"]
    invalid = result["invalid_count"]
    rule_counts = result["rule_counts"]
    category_counts = result["category_counts"]
    status_counts = result["status_counts"]
    country_counts = result["country_counts"]
    sat_scores = result["satisfaction_scores"]
    sat_dist = result["satisfaction_distribution"]
    avg_sat = result["avg_satisfaction"]

    cat_total = sum(category_counts.values())
    status_total = sum(status_counts.values())
    country_total = sum(country_counts.values())
    closed_total = len(sat_scores)

    print()
    print("=" * 60)
    print("  HEALTHCORE \u2014 PATIENT INCIDENT REPORT ANALYSIS")
    print(f"  Source file: {os.path.basename(filepath)}")
    print("=" * 60)
    print()
    print(f"TOTAL RECORDS IN FILE .......... {total}")
    print(f"  \u251c\u2500 Valid records ................ {valid}")
    print(f"  \u2514\u2500 Invalid / incomplete .......... {invalid}")
    print()
    print("INVALID RECORDS BREAKDOWN")
    print(f"  \u251c\u2500 Invalid or missing clinic_id .. {rule_counts['Invalid or missing clinic_id']}")
    print(f"  \u251c\u2500 Country/clinic mismatch ....... {rule_counts['Country/clinic mismatch']}")
    print(f"  \u251c\u2500 Invalid or missing category ... {rule_counts['Invalid or missing category']}")
    print(f"  \u251c\u2500 Empty description ............. {rule_counts['Empty description']}")
    print(f"  \u251c\u2500 Missing patient_id ............ {rule_counts['Missing patient_id']}")
    print(f"  \u2514\u2500 Closed case, no score ......... {rule_counts['Closed case, no score']}")
    print()

    print("BREAKDOWN BY CATEGORY (valid records)")
    for i, cat in enumerate(VALID_CATEGORIES_ORDERED):
        cnt = category_counts.get(cat, 0)
        prefix = "\u251c\u2500" if i < len(VALID_CATEGORIES_ORDERED) - 1 else "\u2514\u2500"
        print(f"  {prefix} {cat:20s} {cnt:3d}  ({pct(cnt, cat_total)})")
    print()

    print("BREAKDOWN BY STATUS (valid records)")
    for i, st in enumerate(VALID_STATUSES_ORDERED):
        cnt = status_counts.get(st, 0)
        prefix = "\u251c\u2500" if i < len(VALID_STATUSES_ORDERED) - 1 else "\u2514\u2500"
        print(f"  {prefix} {st:10s} {cnt:5d}  ({pct(cnt, status_total)})")
    print()

    print("BREAKDOWN BY COUNTRY (valid records) \u2014 recommended, not required")
    sorted_countries = sorted(country_counts.items(), key=lambda x: -x[1])
    for i, (cntry, cnt) in enumerate(sorted_countries):
        prefix = "\u251c\u2500" if i < len(sorted_countries) - 1 else "\u2514\u2500"
        print(f"  {prefix} {cntry:2s} .......................... {cnt:3d}  ({pct(cnt, country_total)})")
    print()

    print("SATISFACTION INDEX (closed cases)")
    print(f"  Scored cases: {closed_total} of {status_counts.get('CLOSED', 0)}")
    print(f"  Average score: {avg_sat:.2f} / 5.00")
    labels = {1: "Very dissatisfied", 2: "Dissatisfied", 3: "Neutral", 4: "Satisfied", 5: "Very satisfied"}
    for score in range(1, 6):
        cnt = sat_dist.get(score, 0)
        prefix = "\u251c\u2500" if score < 5 else "\u2514\u2500"
        print(f"  {prefix} Score {score} ({labels[score]:19s}) ... {cnt:2d}")
    print()
    print("=" * 60)


# ── CSV Export ─────────────────────────────────────────────────────────────

def export_csv(result: dict, filepath: str = "results.csv") -> None:
    """Export analysis results to a CSV file (one row per metric)."""
    with open(filepath, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["metric", "value", "percentage"])

        # Totals
        writer.writerow(["total_records", str(result["total"]), ""])
        writer.writerow(["valid_records", str(result["valid_count"]),
                         pct(result["valid_count"], result["total"])])
        writer.writerow(["invalid_records", str(result["invalid_count"]),
                         pct(result["invalid_count"], result["total"])])

        # Invalid breakdown
        for rule, count in sorted(result["rule_counts"].items()):
            metric_name = f"invalid_{rule.lower().replace(' ', '_')}"
            writer.writerow([metric_name, str(count), ""])

        # Category breakdown
        cat_total = sum(result["category_counts"].values())
        for cat, cnt in sorted(result["category_counts"].items()):
            writer.writerow([f"category_{cat.lower()}", str(cnt), pct(cnt, cat_total)])

        # Status breakdown
        status_total = sum(result["status_counts"].values())
        for st, cnt in sorted(result["status_counts"].items()):
            writer.writerow([f"status_{st.lower()}", str(cnt), pct(cnt, status_total)])

        # Country breakdown
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

    print(f"  Results exported to {filepath}")


# ── Main ───────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze.py <path-to-csv>")
        sys.exit(1)

    filepath = sys.argv[1]

    if not os.path.isfile(filepath):
        print(f"ERROR: File not found: {filepath}")
        sys.exit(1)

    if os.path.getsize(filepath) == 0:
        print(f"ERROR: File is empty: {filepath}")
        sys.exit(1)

    try:
        result = analyze(filepath)
    except ValueError as exc:
        print(f"ERROR: {exc}")
        sys.exit(1)

    print_report(result)

    # Ask about CSV export
    try:
        answer = input("\nExport results to CSV? [y / n]: ").strip().lower()
    except (EOFError, KeyboardInterrupt):
        answer = "n"

    if answer == "y":
        export_csv(result)
    else:
        print("  Export skipped.")


if __name__ == "__main__":
    main()