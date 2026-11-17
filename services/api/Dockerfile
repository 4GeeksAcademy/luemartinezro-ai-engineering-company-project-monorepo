# ============================================================
# HealthCore Central API — Dockerfile
#
# Self-contained build context: ./services/api
# Uses uv for Python package management (via pyproject.toml).
# ============================================================

# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM python:3.14-alpine AS deps

COPY --from=ghcr.io/astral-sh/uv:0.13 /uv /uvx /bin/

WORKDIR /app

# Copy only dependency files for layer caching
COPY pyproject.toml ./

# Install dependencies only (skip the project itself)
RUN uv sync --no-dev --no-install-project

# ============================================================
# Stage 2: Build
# ============================================================
FROM python:3.14-alpine AS build

COPY --from=ghcr.io/astral-sh/uv:0.13 /uv /uvx /bin/

WORKDIR /app

COPY --from=deps /app/.venv /app/.venv
COPY pyproject.toml ./
COPY app/ ./app/
COPY main.py ./
COPY seed.py ./

# Build the project into the existing venv
RUN uv sync --no-dev

# ============================================================
# Stage 3: Runner
# ============================================================
FROM python:3.14-alpine AS runner

COPY --from=ghcr.io/astral-sh/uv:0.13 /uv /uvx /bin/

WORKDIR /app

COPY --from=build /app/.venv /app/.venv
COPY app/ ./app/
COPY main.py ./
COPY seed.py ./

RUN mkdir -p /app/data

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --spider http://localhost:8000/health 2>/dev/null || exit 1

CMD ["uv", "run", "api"]