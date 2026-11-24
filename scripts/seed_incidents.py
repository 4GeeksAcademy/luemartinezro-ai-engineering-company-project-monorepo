#!/usr/bin/env python3
"""
HealthCore — Incident Seed Script.

Loads historical incident data from ``incidents-healthcore.csv`` into the
incident manager database.

Usage:
    uv run python scripts/seed_incidents.py

The script:
- Reads the CSV file from ``data/incidents-healthcore.csv``
- Applies the CSV-to-model transformations defined in Company-BRIEFING.md
- Reuses shared validation logic from ``packages/shared/healthcore/``
- Is idempotent: checks ``incident_id`` before inserting to avoid duplicates
- Logs invalid/unmappable records to the console
- Reports final counts of inserted, skipped, and discarded records

Expected result: 94 valid records inserted matching:
    - 28 open, 52 resolved, 14 discarded
    - 61 patient_experience, 20 billing_error, 13 other
"""

import csv
import os
import sys

# ── Path setup ─────────────────────────────────────────────────────────────

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
DEFAULT_INPUT = os.path.join(DATA_DIR, "incidents-healthcore.csv")

# Ensure the shared package is importable
SHARED_PKG_DIR = os.path.join(PROJECT_ROOT, "packages", "shared")
if SHARED_PKG_DIR not in sys.path:
    sys.path.insert(0, SHARED_PKG_DIR)

# Ensure the API modules are importable (for the DB)
API_DIR = os.path.join(PROJECT_ROOT, "services", "api")
if API_DIR not in sys.path:
    sys.path.insert(0, API_DIR)

from healthcore.validation import transform_csv_to_model
from app.db.incidents import check_idempotent, insert_incident

# CSV column name mapping (as they appear in the header)
# The analyzer project uses lowercase header names.
CSV_COLUMNS = [
    "incident_id",
    "date",
    "clinic_id",
    "country",
    "category",
    "description",
    "status",
    "patient_id",
    "satisfaction_score",
]


# ── Main ────────────────────────────────────────────────────────────────────

def main(csv_path: str = DEFAULT_INPUT) -> None:
    if not os.path.exists(csv_path):
        print(f"❌ File not found: {csv_path}")
        print("   Place the CSV file at: data/incidents-healthcore.csv")
        sys.exit(1)

    print(f"📂 Reading CSV: {csv_path}")
    print()

    # ── Parse CSV ──
    rows: list[dict[str, str]] = []
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            print("❌ CSV file has no headers.")
            sys.exit(1)

        # Normalise headers to lowercase
        fieldnames = [h.strip().lower() for h in reader.fieldnames]
        for row in reader:
            normalised = {}
            for raw_key, value in row.items():
                key = raw_key.strip().lower()
                normalised[key] = (value or "").strip()
            rows.append(normalised)

    total_rows = len(rows)
    print(f"📊 Total rows in CSV: {total_rows}")
    print()

    # ── Process each row ──
    inserted_count = 0
    skipped_idempotent = 0
    discarded_count = 0
    discarded_rows: list[tuple[int, str]] = []  # (row_number, reason)

    for idx, row in enumerate(rows, start=1):
        # Transform CSV fields into model-compatible dict
        model_data = transform_csv_to_model(row)

        if model_data is None:
            # Row could not be mapped / transformed — discard
            csv_incident_id = row.get("incident_id", "?")
            discarded_count += 1
            discarded_rows.append((idx, f"Row {idx}: incident_id={csv_incident_id} — failed to transform"))
            continue

        # ── Idempotency check ──
        csv_incident_id = model_data.get("_csv_incident_id")
        if csv_incident_id:
            # Some CSV rows may have incident_id; check against DB
            # We store _csv_incident_id in the doc so we can detect duplicates
            pass  # We'll set it in the insert

        # Check by the idempotency identifier if present
        if csv_incident_id and check_idempotent(csv_incident_id):
            skipped_idempotent += 1
            continue

        # ── Insert ──
        insert_doc = {
            "_csv_incident_id": csv_incident_id or "",
            "title": model_data["title"],
            "description": model_data["description"],
            "category": model_data["category"],
            "status": model_data["status"],
            "origin": model_data["origin"],
            "branch": model_data["branch"],
            "created_at": model_data["created_at"],
            "updated_at": model_data["updated_at"],
        }
        insert_incident(insert_doc)
        inserted_count += 1

    # ── Report ──
    print("=" * 60)
    print("  SEED RESULTS")
    print("=" * 60)
    print(f"  Total rows in CSV:  {total_rows}")
    print(f"  ✅ Inserted:        {inserted_count}")
    print(f"  ⏭️  Skipped (dup):  {skipped_idempotent}")
    print(f"  ❌ Discarded:       {discarded_count}")
    print()

    if discarded_rows:
        print("  Discarded records:")
        for row_num, reason in discarded_rows:
            print(f"    {reason}")
        print()

    print("✅ Seeding complete.")


if __name__ == "__main__":
    main()