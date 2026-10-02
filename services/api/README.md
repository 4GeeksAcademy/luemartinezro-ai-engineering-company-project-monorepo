# HealthCore Central API

> **Ruta:** `services/api/`  
> API centralizada de HealthCore, construida con FastAPI.

---

## Propósito

Proporcionar una API unificada que exponga datos de pacientes, citas, facturación, clínicas y personal de HealthCore, consumiendo desde los sistemas EHR existentes y sirviendo a los frontends (web pública, backoffice, talent pipeline tracker).

## Stack

| Componente | Tecnología |
|-----------|------------|
| Framework | **FastAPI** (Python 3.11+) |
| Documentación | Swagger UI (OpenAPI) en `/docs` |
| Ejecución | `uvicorn app.main:app --reload` |

## Estructura

```
services/api/
├── app/
│   ├── __init__.py
│   ├── main.py              # App FastAPI, inicio, CORS
│   ├── data.py              # Datos en memoria (desde CONTEXT.md)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── clinics.py        # Endpoints de clínicas (list, detail, country filter)
│   │   └── departments.py    # Endpoints de departamentos (list, detail, KPIs)
│   └── models/
│       ├── __init__.py
│       └── schemas.py        # Pydantic v2 models (ClinicLocation, Department, etc.)
├── requirements.txt
├── README.md
└── package.json
```

## Endpoints verificados

### `GET /health` — Health check (`{"status":"ok","version":"0.1.0"}`)
### `GET /clinics` — Listar todas las clínicas (9 US + 3 UK)
### `GET /clinics/{id}` — Detalle de una clínica (ej: `london-bridge`)
### `GET /clinics/country/{country}` — Clínicas por país (`US` / `GB`)
### `GET /departments` — Listar departamentos con responsables y KPIs
### `GET /departments/{id}/kpis` — KPIs de un departamento (ej: `compliance`)
### `GET /docs` — Documentación Swagger UI (OpenAPI)
### `GET /redoc` — Documentación ReDoc

## Cómo ejecutar

```bash
cd services/api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

La documentación interactiva estará disponible en:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Datos

Todos los datos servidos por la API provienen de `CONTEXT.md` en la raíz del monorepo:
- 12 clínicas (9 US, 3 UK) con direcciones, teléfonos y horarios reales
- 7 departamentos con responsables, KPIs y problemas documentados
- Métricas operativas (no-show rate, denial rate, tiempo de contratación, etc.)

## Pruebas rápidas

```bash
# Health check
curl http://localhost:8000/health

# Listar clínicas
curl http://localhost:8000/clinics | python3 -m json.tool

# Clínicas en Reino Unido
curl http://localhost:8000/clinics/country/GB | python3 -m json.tool

# KPIs de Compliance
curl http://localhost:8000/departments/compliance/kpis | python3 -m json.tool
```