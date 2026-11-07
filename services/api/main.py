"""
HealthCore Central API — Main application.

FastAPI entry point with CORS, routers, and health check.
Suppliers are managed via routes/suppliers.py.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.suppliers import router as suppliers_router

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

@app.get("/health", tags=["system"])
async def health_check():
    """Return service health status."""
    return {"status": "ok", "version": "0.1.0", "service": "HealthCore Central API"}


# ── Routers ──

app.include_router(suppliers_router)