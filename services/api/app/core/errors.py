"""
HealthCore Central API — Error utilities.

Reusable HTTP exceptions and helpers for consistent error responses.
"""

from fastapi import HTTPException, status


# ── 401 Unauthorized ──

def unauthorized(detail: str = "Not authenticated") -> HTTPException:
    """Return a standard 401 response."""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


# ── 403 Forbidden ──

def forbidden(detail: str = "Not enough permissions") -> HTTPException:
    """Return a standard 403 response."""
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail,
    )


# ── 404 Not Found ──

def not_found(detail: str = "Resource not found") -> HTTPException:
    """Return a standard 404 response."""
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=detail,
    )


# ── 409 Conflict ──

def conflict(detail: str = "Resource already exists") -> HTTPException:
    """Return a standard 409 response."""
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=detail,
    )