"""
HealthCore Central API — TinyDB instance.

Provides a singleton-like TinyDB instance pointed at the configured JSON file.
Tables are created on demand via the `table()` method.
"""

from tinydb import TinyDB

from app.core.settings import settings

_db: TinyDB | None = None


def get_db() -> TinyDB:
    """Return the global TinyDB instance (lazily initialised)."""
    global _db
    if _db is None:
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