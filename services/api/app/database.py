"""
HealthCore — TinyDB Database Wrapper.

Provides a shared TinyDB instance for supplier management.
Suppliers are stored in data/suppliers.json relative to the project root.
"""

import os
from tinydb import TinyDB, Query

# ── Paths ──

# Resolve the data directory relative to the services/api folder
_API_DIR = os.path.dirname(os.path.abspath(__file__))
_DATA_DIR = os.path.join(os.path.dirname(_API_DIR), "data")

# Ensure the data directory exists
os.makedirs(_DATA_DIR, exist_ok=True)

_SUPPLIERS_DB_PATH = os.path.join(_DATA_DIR, "suppliers.json")

# ── Database instances ──

_suppliers_db = TinyDB(_SUPPLIERS_DB_PATH)
suppliers_table = _suppliers_db.table("suppliers")

# ── Query helper ──

SupplierQuery = Query()


def count_suppliers() -> int:
    """Return the number of suppliers in the database."""
    return len(suppliers_table)


def is_empty() -> bool:
    """Return True if the suppliers table has no records."""
    return count_suppliers() == 0