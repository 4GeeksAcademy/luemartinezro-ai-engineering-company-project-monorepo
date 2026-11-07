# HealthCore Central API

> **Ruta:** `services/api/`  
> API centralizada de HealthCore, construida con FastAPI.

---

## Propósito

Proporcionar una API unificada que exponga datos de pacientes, citas, facturación, clínicas, personal y **proveedores (suppliers)** de HealthCore, consumiendo desde los sistemas EHR existentes y sirviendo a los frontends (web pública, backoffice, talent pipeline tracker).

## Stack

| Componente         | Tecnología                                       |
|--------------------|--------------------------------------------------|
| Framework          | **FastAPI** (Python 3.11+)                       |
| Base de datos      | **TinyDB** (JSON embebido, migración a Postgres planificada) |
| Validación         | **Pydantic v2** con Enums, field validators y modelos separados input/response |
| Documentación      | Swagger UI (OpenAPI) en `/docs`                  |
| Ejecución          | `uvicorn main:app --reload` o `uvicorn app.main:app --reload` |

## Estructura

```
services/api/
├── main.py                  # Entry point principal (FastAPI, CORS, health check) — versión flat
├── database.py              # Wrapper TinyDB — tabla suppliers en data/suppliers.json
├── models.py                # Modelos Pydantic: SupplierCreate, SupplierResponse, SupplierDocument, RateUpdate, StatusUpdate
├── seed.py                  # Seeder: carga 12 proveedores iniciales desde Company-BRIEFING.md
├── routes/
│   ├── __init__.py
│   └── suppliers.py         # Router CRUD de proveedores (/suppliers)
├── app/                     # Versión empaquetada (migración en curso)
│   ├── __init__.py
│   ├── main.py              # App FastAPI con routers adicionales (clinics, departments, incidents, suppliers)
│   ├── database.py          # Wrapper TinyDB para app/
│   ├── data.py              # Datos en memoria (desde CONTEXT.md y Company-BRIEFING.md)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── clinics.py        # Endpoints de clínicas (list, detail, country filter)
│   │   ├── departments.py    # Endpoints de departamentos (list, detail, KPIs)
│   │   ├── incidents.py      # Endpoints de análisis de incidentes
│   │   └── suppliers.py      # Router CRUD de proveedores (idéntico al flat)
│   └── models/
│       ├── __init__.py
│       ├── schemas.py        # Pydantic v2 (ClinicLocation, Department, etc.)
│       └── suppliers.py      # Modelos Pydantic de proveedores (idéntico al flat)
├── data/
│   └── suppliers.json        # Base de datos TinyDB (autogenerada por el seeder)
├── requirements.txt
├── pyproject.toml            # Gestión de dependencias con uv
├── uv.lock
└── README.md
```

> **Nota sobre la estructura dual:** Existe una versión `flat` (`main.py`, `database.py`, `models.py`, `routes/`) y una versión empaquetada (`app/`). Ambas son funcionales y expónen los mismos endpoints. La versión `app/` se está consolidando como la definitiva; la versión flat se mantiene por compatibilidad.

---

## Supplier Directory — Directorio de Proveedores

HealthCore gestiona sus proveedores de suministros sanitarios a través de un directorio digital que reemplaza la hoja de cálculo anterior. La solución usa **TinyDB + Pydantic + FastAPI**.

### Modelo de datos

| Campo        | Tipo            | Restricciones                                                 |
|--------------|-----------------|---------------------------------------------------------------|
| `name`       | `string`        | 2–200 caracteres                                              |
| `country`    | `string`        | `US` o `UK` — validado por Pydantic                           |
| `categories` | `list[enum]`    | Al menos una: `MEDICAL_SUPPLIES`, `PHARMACEUTICALS`, `MEDICAL_EQUIPMENT`, `IT_SERVICES`, `ADMINISTRATIVE` |
| `rate`       | `float`         | Mayor que 0 — validado por Pydantic antes de llegar a TinyDB  |
| `status`     | `enum`          | `active` o `suspended`                                        |
| `updated_at` | `string` (ISO)  | Generado automáticamente por el sistema — no se envía desde el cliente |

### Endpoints del supplier directory

| Método   | Ruta                          | Comportamiento                                                              | Códigos de respuesta |
|----------|-------------------------------|-----------------------------------------------------------------------------|----------------------|
| `POST`   | `/suppliers`                  | Registrar un nuevo proveedor. Valida con Pydantic; rechaza con 422 si inválido | `201` / `422`       |
| `GET`    | `/suppliers`                  | Listar proveedores. Filtros opcionales: `?country=US`, `?category=IT_SERVICES` | `200`               |
| `GET`    | `/suppliers/{id}`             | Detalle de un proveedor por ID TinyDB                                       | `200` / `404`       |
| `PATCH`  | `/suppliers/{id}/rate`        | Actualizar la tarifa. Rechaza valores ≤ 0. Registra `updated_at` automáticamente | `200` / `404` / `422` |
| `PATCH`  | `/suppliers/{id}/status`      | Activar o suspender un proveedor. Solo acepta `active` / `suspended`        | `200` / `404` / `422` |
| `DELETE` | `/suppliers/{id}`             | Eliminar un proveedor del directorio                                        | `204` / `404`       |

### Validaciones (Pydantic, antes de TinyDB)

- `rate` debe ser **estrictamente positivo** (`gt=0`). El campo `gt` de Pydantic rechaza 0 y negativos con `422` antes de cualquier escritura.
- `country` debe ser exactamente `US` o `UK`. Cualquier otro valor produce error de validación.
- `categories` debe contener al menos un elemento de los 5 valores permitidos.
- `status` debe ser `active` o `suspended` (definido como Enum de Pydantic).
- `name` debe tener entre 2 y 200 caracteres.
- `updated_at` es generado por el sistema en `SupplierDocument.from_create()` y en los endpoints `PATCH` — el cliente no lo envía.

### Seeder

El script `seed.py` carga los **12 proveedores iniciales** definidos en `Company-BRIEFING.md` en TinyDB.

**Cómo ejecutarlo (con uv):**

```bash
cd services/api
uv run python seed.py
```

**Comportamiento:**
- Si la base de datos ya contiene datos, el seeder **no crea duplicados** — verifica con `is_empty()` antes de insertar.
- Cada proveedor se valida con Pydantic (`SupplierCreate`) antes de insertarse.
- Muestra en consola cada inserción y el total al final: `✅ Seeding complete. 12 supplier(s) inserted.`
- Si ya hay datos: `Database already contains N suppliers. Skipping seed.`

---

## Endpoints verificados

### Salud y sistema
- `GET /health` — Health check (`{"status":"ok","version":"0.1.0"}`)
- `GET /docs` — Documentación Swagger UI (OpenAPI)
- `GET /redoc` — Documentación ReDoc

### Clínicas
- `GET /clinics` — Listar todas las clínicas (9 US + 3 UK)
- `GET /clinics/{id}` — Detalle de una clínica (ej: `london-bridge`)
- `GET /clinics/country/{country}` — Clínicas por país (`US` / `GB`)

### Departamentos
- `GET /departments` — Listar departamentos con responsables y KPIs
- `GET /departments/{id}/kpis` — KPIs de un departamento (ej: `compliance`)

### Proveedores (Supplier Directory)
- `POST /suppliers` — Registrar nuevo proveedor (201 / 422)
- `GET /suppliers` — Listar con filtros opcionales `?country=` y `?category=`
- `GET /suppliers/{id}` — Detalle por ID (200 / 404)
- `PATCH /suppliers/{id}/rate` — Actualizar tarifa (200 / 404 / 422)
- `PATCH /suppliers/{id}/status` — Activar/suspender (200 / 404 / 422)
- `DELETE /suppliers/{id}` — Eliminar proveedor (204 / 404)

---

## Cómo ejecutar

### Versión flat (main.py)

```bash
cd services/api
uv run uvicorn main:app --reload --port 8000
```

### Versión empaquetada (app/)

```bash
cd services/api
uv run uvicorn app.main:app --reload --port 8000
```

La documentación interactiva estará disponible en:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Datos

Los datos provienen de dos fuentes:
- **`CONTEXT.md`** en la raíz del monorepo: clínicas, departamentos, métricas operativas.
- **`Company-BRIEFING.md`** en la raíz del monorepo: proveedores iniciales, categorías, estados permitidos.

### Proveedores iniciales (12)

| Proveedor                   | País  | Categorías                        | Tarifa  | Estado     |
|-----------------------------|-------|-----------------------------------|---------|------------|
| MedSupply Texas LLC         | US    | Medical Supplies                  | $250.00 | active     |
| PharmaCare Solutions        | US    | Pharmaceuticals                   | $480.00 | active     |
| HealthTech Equipment        | US    | Medical Equipment                 | $1,200.00 | active   |
| CloudMed IT Services        | UK    | IT Services                       | $350.00 | active     |
| OfficePro Admin Supplies    | US    | Administrative                    | $85.00  | active     |
| UK Pharma Distributors      | UK    | Pharmaceuticals                   | $420.00 | active     |
| GlobalScan Imaging          | US    | Medical Equipment, IT Services    | $950.00 | suspended  |
| London Medical Supplies     | UK    | Medical Supplies                  | $195.00 | active     |
| Atlantic Healthcare IT      | US    | IT Services                       | $600.00 | active     |
| CleanCare Administrative    | UK    | Administrative                    | $65.00  | suspended  |
| Florida Pharma Group        | US    | Pharmaceuticals                   | $510.00 | active     |
| Manchester MedEquipment     | UK    | Medical Equipment                 | $875.00 | active     |

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

# --- Proveedores ---

# Listar todos los proveedores
curl http://localhost:8000/suppliers | python3 -m json.tool

# Filtrar por país
curl "http://localhost:8000/suppliers?country=UK" | python3 -m json.tool

# Filtrar por categoría
curl "http://localhost:8000/suppliers?category=IT_SERVICES" | python3 -m json.tool

# Detalle de un proveedor
curl http://localhost:8000/suppliers/1 | python3 -m json.tool

# Crear un nuevo proveedor
curl -X POST http://localhost:8000/suppliers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Supplier","country":"US","categories":["MEDICAL_SUPPLIES"],"rate":500.0,"status":"active"}' | python3 -m json.tool

# Actualizar tarifa
curl -X PATCH http://localhost:8000/suppliers/1/rate \
  -H "Content-Type: application/json" \
  -d '{"rate":275.0}' | python3 -m json.tool

# Cambiar estado
curl -X PATCH http://localhost:8000/suppliers/2/status \
  -H "Content-Type: application/json" \
  -d '{"status":"suspended"}' | python3 -m json.tool

# Eliminar un proveedor
curl -X DELETE http://localhost:8000/suppliers/13
```