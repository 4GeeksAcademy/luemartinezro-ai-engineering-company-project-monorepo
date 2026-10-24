"""
HealthCore Central API — Main application.

FastAPI entry point with CORS, routers, and health check.
Now with authentication, users, and profiles modules.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import settings
from app.modules.auth.router import router as auth_router
from app.modules.profiles.router import router as profiles_router
from app.modules.users.router import router as users_router
from app.models.schemas import HealthResponse
from app.routers import clinics, departments

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


# ── Health check (public) ──

@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check():
    """Return service health status."""
    return HealthResponse()


# ── Routers ──

app.include_router(clinics.router)
app.include_router(departments.router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profiles_router)