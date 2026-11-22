"""
HealthCore Central API — Settings.

Centralised typed configuration via environment variables.
Uses pydantic-settings (BaseSettings) to load from .env automatically.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings — override any field via environment variable."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── JWT ──
    JWT_SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_ALGORITHM: str = "HS256"

    # ── TinyDB ──
    TINYDB_PATH: str = str(Path(__file__).resolve().parent.parent.parent / "data" / "tinydb.json")

    # ── API ──
    API_TITLE: str = "HealthCore Central API"
    API_VERSION: str = "0.2.0"
    API_DESCRIPTION: str = (
        "Unified API for HealthCore's clinical, operational, and financial data. "
        "Now with authentication and role-based access control."
    )

    # ── CORS (comma-separated list of origins) ──
    CORS_ORIGINS: str = "*"

    # ── Password Reset ──
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # ── Resend (email) ──
    RESEND_API_KEY: str = ""

    # ── Frontend URL (for password reset links in emails) ──
    # Set this to the public/base URL of the frontend application
    # (e.g. "http://localhost:3001" for local dev,
    #       "https://<workspace>-3001.app.github.dev" for Codespaces,
    #       "https://backoffice.healthcore.com" for production).
    # If not set, the reset link is derived from the incoming request's
    # base URL by replacing the API port (8000) with the frontend port (3001).
    FRONTEND_URL: str = ""


settings = Settings()