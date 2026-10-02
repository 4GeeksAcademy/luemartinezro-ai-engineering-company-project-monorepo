"""
HealthCore Central API — Main application.

FastAPI entry point with CORS, routers, and health check.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import HealthResponse
from app.routers import clinics, departments

app = FastAPI(
    title="HealthCore Central API",
    description="Unified API for HealthCore's clinical, operational, and financial data.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Allow all origins during development — restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ──

@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check():
    """Return service health status."""
    return HealthResponse()


# ── Routers ──

app.include_router(clinics.router)
app.include_router(departments.router)