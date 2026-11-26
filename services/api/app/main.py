"""
HealthCore Central API — Main application.

FastAPI entry point with CORS, routers, exception handlers, and health check.
Now with authentication, users, profiles, and incident management modules.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.core.settings import settings
from app.db.tinydb import init_db
from app.modules.auth.router import router as auth_router
from app.modules.profiles.router import router as profiles_router
from app.modules.users.router import router as users_router
from app.models.schemas import HealthResponse
from app.routers import clinics, departments, incidents, suppliers
from app.routers.incident_manager import router as incident_manager_router

# ── Ensure the TinyDB data directory exists before any request ──
init_db()

app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
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


# ── Global exception handler ──
# Never exposes stack traces to the client — always returns a generic 500.

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unhandled exceptions and return a generic 500 response."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


# ── Health check (public) ──

@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check():
    """Return service health status."""
    return HealthResponse()


# ── Routers ──

app.include_router(incident_manager_router)
app.include_router(clinics.router)
app.include_router(departments.router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(incidents.router)
app.include_router(suppliers.router)


def start() -> None:
    uvicorn.run(app, host="0.0.0.0", port=8000)
