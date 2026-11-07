#!/usr/bin/env python3
"""
HealthCore — Supplier Seeder.

Loads initial supplier data into TinyDB.
Designed to be executed with:  uv run python seed.py  (from services/api/)
Also works with:               uv run seed.py
Also works with:               uv run -m seed

If the database already has data, the seeder skips insertion
to avoid creating duplicates.
"""

import sys
import os

# Ensure the project root is on the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import suppliers_table, is_empty, SupplierQuery
from app.models.suppliers import (
    SupplierDocument,
    SupplierCreate,
    SupplierCategory,
    SupplierStatus,
)


# ── Initial suppliers (aligned with HealthCore's healthcare procurement) ──

INITIAL_SUPPLIERS: list[dict] = [
    {
        "name": "MedSupply Texas LLC",
        "country": "US",
        "categories": [SupplierCategory.MEDICAL_SUPPLIES],
        "rate": 250.00,
        "status": SupplierStatus.ACTIVE,
    },
    {
        "name": "PharmaCare Solutions",
        "country": "US",
        "categories": [SupplierCategory.PHARMACEUTICALS],
        "rate": 480.00,
        "status": SupplierStatus.ACTIVE,
    },
    {
        "name": "HealthTech Equipment",
        "country": "US",
        "categories": [SupplierCategory.MEDICAL_EQUIPMENT],
        "rate": 1200.00,
        "status": SupplierStatus.ACTIVE,
    },
    {
        "name": "CloudMed IT Services",
        "country": "UK",
        "categories": [SupplierCategory.IT_SERVICES],
        "rate": 350.00,
        "status": SupplierStatus.ACTIVE,
    },
    {
        "name": "OfficePro Admin Supplies",
        "country": "US",
        "categories": [SupplierCategory.ADMINISTRATIVE],
        "rate": 85.00,
        "status": SupplierStatus.ACTIVE,
    },
    {
        "name": "UK Pharma Distributors",
        "country": "UK",
        "categories": [SupplierCategory.PHARMACEUTICALS],
        "rate": 420.00,
        "status": SupplierStatus.ACTIVE,
    },
    {
        "name": "GlobalScan Imaging",
        "country": "US",
        "categories": [SupplierCategory.MEDICAL_EQUIPMENT, SupplierCategory.IT_SERVICES],
        "rate": 950.00,
        "status": SupplierStatus.SUSPENDED,
    },
    {
        "name": "London Medical Supplies",
        "country": "UK",
        "categories": [SupplierCategory.MEDICAL_SUPPLIES],
        "rate": 195.00,
        "status": SupplierStatus.ACTIVE,
    },
    {
        "name": "Atlantic Healthcare IT",
        "country": "US",
        "categories": [SupplierCategory.IT_SERVICES],
        "rate": 600.00,
        "status": SupplierStatus.ACTIVE,
    },
    {
        "name": "CleanCare Administrative",
        "country": "UK",
        "categories": [SupplierCategory.ADMINISTRATIVE],
        "rate": 65.00,
        "status": SupplierStatus.SUSPENDED,
    },
    {
        "name": "Florida Pharma Group",
        "country": "US",
        "categories": [SupplierCategory.PHARMACEUTICALS],
        "rate": 510.00,
        "status": SupplierStatus.ACTIVE,
    },
    {
        "name": "Manchester MedEquipment",
        "country": "UK",
        "categories": [SupplierCategory.MEDICAL_EQUIPMENT],
        "rate": 875.00,
        "status": SupplierStatus.ACTIVE,
    },
]


def main() -> None:
    """Run the seeder: load initial suppliers if the database is empty."""
    if not is_empty():
        print(f"Database already contains {len(suppliers_table)} suppliers. Skipping seed.")
        return

    inserted = 0
    for data in INITIAL_SUPPLIERS:
        # Build a SupplierCreate to validate the data
        try:
            create = SupplierCreate(**data)
        except Exception as e:
            print(f"  ⚠ Skipping '{data['name']}': validation error — {e}")
            continue

        # Convert to document and insert
        doc = SupplierDocument.from_create(create)
        doc_id = suppliers_table.insert(doc.model_dump())
        inserted += 1
        print(f"  ✓ Inserted '{doc.name}' (ID: {doc_id})")

    print(f"\n✅ Seeding complete. {inserted} supplier(s) inserted.")


if __name__ == "__main__":
    main()