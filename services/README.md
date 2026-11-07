# `services` folder

This folder contains **all the backend services** (APIs and background workers) related to the company for the cross-functional AI Engineering project.

Each subfolder inside `services/` must correspond to **one specific service** (for example: `admin-api`, `data-processor-worker`) and include its own technical and functional documentation.

- **Main purpose**: to centralize all the backend logic, APIs, and queue consumers that support the company's use cases.
- **Recommendation**: document in this file (or in sub-READMEs) the services you add, their objective, the technology used, and how to run them.

## Current services

| Service | Path | Description | Stack |
|---------|------|-------------|-------|
| **HealthCore Central API** | [`services/api/`](./api/) | Unified REST API for clinics, departments, incidents, and **supplier management** | FastAPI, Pydantic v2, TinyDB, Uvicorn |
| **Supplier Directory API** | [`services/api/routes/suppliers.py`](./api/routes/suppliers.py) | CRUD endpoints for managing procurement suppliers (POST, GET, PATCH, DELETE) | FastAPI, TinyDB, Pydantic |
| **Supplier Seeder** | [`services/api/seed.py`](./api/seed.py) | Seeds 12 initial suppliers from `Company-BRIEFING.md` into TinyDB | Python, TinyDB, Pydantic |

> _Spanish version: [README.es.md](./README.es.md)._
