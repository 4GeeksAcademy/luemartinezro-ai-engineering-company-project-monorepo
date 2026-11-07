# Carpeta `services`

Esta carpeta contiene **todos los servicios backend** (APIs y workers en segundo plano) relacionados con la compañía para el proyecto transversal de AI Engineering.

Cada subcarpeta dentro de `services/` debe corresponder a **un servicio concreto** (por ejemplo `admin-api`, `data-processor-worker`) e incluir su propia documentación técnica y funcional.

- **Propósito principal**: centralizar toda la lógica backend, APIs y consumidores de colas que dan soporte a los casos de uso de la compañía.
- **Recomendación**: documenta en este archivo (o en sub-READMEs) los servicios que vayas añadiendo, su objetivo, tecnología usada y cómo ejecutarlos.

## Servicios actuales

| Servicio | Ruta | Descripción | Stack |
|----------|------|-------------|-------|
| **HealthCore Central API** | [`services/api/`](./api/) | API REST unificada para clínicas, departamentos, incidencias y **gestión de proveedores** | FastAPI, Pydantic v2, TinyDB, Uvicorn |
| **Supplier Directory API** | [`services/api/app/routers/suppliers.py`](./api/app/routers/suppliers.py) | Endpoints CRUD para gestionar proveedores de compras (POST, GET, PATCH, DELETE), registrados en la API central | FastAPI, TinyDB, Pydantic |
| **Supplier Seeder** | [`services/api/seed.py`](./api/seed.py) | Inserta 12 proveedores iniciales desde `Company-BRIEFING.md` en TinyDB | Python, TinyDB, Pydantic |
