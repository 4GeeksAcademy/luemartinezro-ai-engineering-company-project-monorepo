"""
CLI entry point for database operations.

Usage:
    uv run init-db

This will create the TinyDB data directory and file if they don't exist,
so the API is ready to use.
"""

from app.db.tinydb import init_db as _init_db


def init_db() -> None:
    """Initialize the TinyDB database file (idempotent)."""
    _init_db()
    print("✅ TinyDB data directory and file are ready.")


if __name__ == "__main__":
    init_db()