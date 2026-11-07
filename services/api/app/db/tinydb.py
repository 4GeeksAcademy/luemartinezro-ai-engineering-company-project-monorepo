"""
HealthCore Central API — TinyDB instance.

Provides a singleton-like TinyDB instance pointed at the configured JSON file.
Tables are created on demand via the `table()` method.

The data directory is automatically created on first use if it does not exist,
so no manual setup is required before running the API.
"""

import os
from pathlib import Path

from tinydb import TinyDB

from app.core.settings import settings

_db: TinyDB | None = None


def _ensure_data_dir(path: str) -> None:
    """Create the parent directory for the TinyDB file if it doesn't exist."""
    parent = Path(path).parent
    if not parent.exists():
        parent.mkdir(parents=True, exist_ok=True)


def get_db() -> TinyDB:
    """Return the global TinyDB instance (lazily initialised).

    Creates the data directory on first call if it does not exist,
    so the API can be started without any manual setup.
    """
    global _db
    if _db is None:
        _ensure_data_dir(settings.TINYDB_PATH)
        _db = TinyDB(settings.TINYDB_PATH, sort_keys=True, indent=2)
    return _db


def get_table(name: str):
    """
    Return a TinyDB table by name.

    Usage:
        users_table = get_table("users")
        users_table.insert({"email": "a@b.com"})
    """
    return get_db().table(name)


def init_db() -> None:
    """Explicitly initialise the TinyDB database file and create the directory if needed.

    Call this function during application startup to ensure the database file
    exists before any request arrives. Idempotent — safe to call multiple times.
    """
    get_db()