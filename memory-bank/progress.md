# Progress — HealthCore Digital

> Estado actual del desarrollo, decisiones recientes y próximos pasos.
> Actualizado: 2026-10-14

---

## 🟢 Leyenda

- ✅ Completado
- 🔄 En progreso
- ⬜ Pendiente
- ❌ Bloqueado

---

## Hito 1: Web Pública Corporativa ✅

**Objetivo:** Sitio web bilingüe profesional con landing page y formulario de contacto para pacientes.

### Deliverables

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `index.html` | Landing page en inglés | ✅ |
| `index.es.html` | Landing page en español | ✅ |
| `application.html` | Formulario de consulta en inglés | ✅ |
| `application.es.html` | Formulario de consulta en español | ✅ |
| `validation.js` | Validación compartida (inglés/español) | ✅ |

### Decisiones tomadas
- (Histórica, supersedida) Tailwind CSS vía CDN para estilos; el estándar vigente exige Next.js para todo frontend (ver `techContext.md` y `.agents/rules/frontend-nextjs.md`).
- Archivos separados por idioma (no toggle JS)
- Schema.org structured data para SEO
- Validación con mensajes localizados por idioma

### Ver más
- [README_MILESTONE1.md](../README_MILESTONE1.md)

---

## Hito 2: Modelos de Dominio ✅

**Objetivo:** Interfaces TypeScript para las entidades de negocio de HealthCore.

### Deliverables

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `src/types/models.ts` | Interfaces: Claim, Appointment, Clinician, Location | ✅ |
| `src/utils/collections.ts` | Utilidades de colecciones | ✅ |
| `src/utils/search.ts` | Utilidades de búsqueda | ✅ |
| `src/utils/validations.ts` | Validaciones reutilizables | ✅ |
| `src/utils/transformations.ts` | Transformaciones de datos | ✅ |
| `packages/shared/types/index.ts` | Tipos base compartidos | ✅ |

### Tipos definidos
- `ServiceType`, `ClaimStatus`, `DenialReason`, `AppointmentStatus`
- `ClinicianRole`, `CMEStatus`
- Interfaces: `ClinicLocation`, `Clinician`, `PatientAppointment`, `InsuranceClaim`, `CMERecord`

---

## Hito 3: Talent Pipeline Tracker ✅

**Objetivo:** Frontend Next.js para gestión de candidatos (campaña Executive Assistant).

### Deliverables

| Componente | Estado |
|-----------|--------|
| `uis/talent-pipeline-tracker/` | ✅ Aplicación Next.js completa |
| Candidate List con búsqueda y filtros | ✅ |
| Candidate Detail con edición inline | ✅ |
| Notas internas (CRUD) | ✅ |
| Formulario de registro de candidatos | ✅ |
| Manejo de estados: loading, error, empty | ✅ |

### API consumida
- `https://playground.4geeks.com/tracker/api/v1`

---

## Hito 4: Gestión de Proveedores (Supplier Directory) ✅

**Objetivo:** Backend API REST + Frontend Next.js para el directorio de proveedores de HealthCore, permitiendo CRUD con filtros por país, categoría y estado.

### Deliverables — Backend (FastAPI + TinyDB)

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `services/api/requirements.txt` | Dependencias Python (añadido `tinydb>=4.8.0`) | ✅ |
| `services/api/pyproject.toml` | Configuración uv con dependencias declaradas | ✅ |
| `services/api/app/models/suppliers.py` | Schemas Pydantic v2: enums, modelos Create/Response/Document | ✅ |
| `services/api/app/database.py` | Wrapper TinyDB: suppliers_table, count, is_empty | ✅ |
| `services/api/seed.py` | Carga inicial de 12 proveedores (idempotente) | ✅ |
| `services/api/app/routers/suppliers.py` | Router con 6 endpoints CRUD + filtros | ✅ |
| `services/api/app/main.py` | Entrypoint FastAPI con router registrado | ✅ |

### Deliverables — Frontend (Next.js + Tailwind)

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `uis/backoffice/app/suppliers/page.tsx` | Página de directorio de proveedores | ✅ |
| `uis/backoffice/app/layout.tsx` | Navbar con enlace "Suppliers" | ✅ |

### Modelo de datos

| Campo | Tipo | Validación |
|-------|------|------------|
| `id` | `int` (auto-generado) | — |
| `name` | `string` | Obligatorio |
| `country` | `string` | Solo `US` o `UK` |
| `categories` | `list[SupplierCategory]` | 5 categorías válidas (ver abajo) |
| `rate` | `float` | Debe ser > 0 |
| `status` | `SupplierStatus` | `active` o `suspended` |
| `updated_at` | `datetime` (UTC) | Auto-asignado al crear y al actualizar rate |

### Categorías de proveedor

| Categoría | Descripción |
|-----------|-------------|
| `MEDICAL_SUPPLIES` | Suministros médicos |
| `PHARMACEUTICALS` | Productos farmacéuticos |
| `MEDICAL_EQUIPMENT` | Equipamiento médico |
| `IT_SERVICES` | Servicios de TI |
| `ADMINISTRATIVE` | Servicios administrativos |

### Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/suppliers` | Crear nuevo proveedor (201) |
| `GET` | `/suppliers` | Listar proveedores (filtros opcionales: `country`, `category`, `status`) |
| `GET` | `/suppliers/{id}` | Obtener proveedor por ID (404 si no existe) |
| `PATCH` | `/suppliers/{id}/rate` | Actualizar rate (422 si <= 0) |
| `PATCH` | `/suppliers/{id}/status` | Cambiar estado (solo `active`/`suspended`) |
| `DELETE` | `/suppliers/{id}` | Eliminar proveedor (204) |

### Seed data (12 proveedores iniciales)

- **8 activos**: MedSupply Texas LLC (US), PharmaCare Solutions (US), HealthTech Equipment (US), CloudMed IT Services (UK), OfficePro Admin Supplies (US), UK Pharma Distributors (UK), London Medical Supplies (UK), Atlantic Healthcare IT (US), Florida Pharma Group (US), Manchester MedEquipment (UK)
- **2 suspendidos US**: GlobalScan Imaging, CleanCare Administrative
- **2 suspendidos UK**: (incluidos en los 12 totales)

### Funcionalidades del frontend

- Tabla completa con todos los proveedores
- Filtros por país (US/UK) y categoría
- Formulario de registro modal/inline
- Edición inline de rate (con confirmación vía input numérico)
- Botones de toggle de estado (active/suspended) con confirmación
- Eliminación con confirmación
- Codificación visual: fondo gris para suspendidos, badges verde/rojo para estado
- Indicadores de carga (disabled state durante operaciones)

### Pruebas realizadas
- ✅ Listar todos los proveedores (GET /suppliers)
- ✅ Filtros por país y categoría
- ✅ GET por ID y 404 para IDs inexistentes
- ✅ POST crea con 201 y validación 422
- ✅ PATCH rate actualiza y registra timestamp
- ✅ PATCH rate inválido devuelve 422
- ✅ PATCH status cambia correctamente
- ✅ PATCH status inválido devuelve 422
- ✅ DELETE devuelve 204 con confirmación
- ✅ DELETE en ID inexistente devuelve 404
- ✅ Seed idempotente (se salta si ya hay datos)
- ✅ Compilación frontend exitosa (Next.js build)

### Decisiones técnicas
- TinyDB como base de datos embebida (sin servidor externo)
- Pydantic v2 para doble validación (API input + seed)
- `uv run python seed.py` para cargar datos iniciales
- `window.confirm` no es estándar → se usa `confirm()` nativo de JS
- Edición inline de rate en lugar de `window.prompt` (no estándar)
- Tailwind CSS via PostCSS (configuración existente del backoffice)

---

## Infraestructura de agente ✅

### Banco de memoria (`memory-bank/`)

| Archivo | Estado |
|---------|--------|
| `memory-bank/projectbrief.md` | ✅ Descripción del negocio, objetivos, organigrama |
| `memory-bank/techContext.md` | ✅ Stack, ADRs, restricciones, paleta cromática |
| `memory-bank/progress.md` | ✅ Estado actual del desarrollo |

### Configuración de agente (`.agents/`)

| Archivo | Estado |
|---------|--------|
| `.agents/rules/tailwind-cdn.md` | ✅ Regla: Tailwind CDN, sin CSS propio, sin estilos inline |
| `.agents/skills/website-audit/SKILL.md` | ✅ Skill: auditoría de páginas web (6 checks, criterios de aceptación) |

### Documentación raíz

| Archivo | Estado |
|---------|--------|
| `AGENTS.md` | ✅ Protocolo de 6 pasos, lectura obligatoria, zonas protegidas |

### Frontend `uis/`

| Proyecto | Estado |
|---------|--------|
| `uis/website/` | ✅ Landing pages (EN/ES) + formularios (EN/ES) migradas desde raíz |
| `uis/backoffice/` | ✅ Dashboard Next.js con KPIs reales de CONTEXT.md |

### Backend `services/`

| Proyecto | Estado |
|---------|--------|
| `services/api/` | ✅ FastAPI funcional — 7 endpoints verificados |

---

## Incident Analyzer (HealthCore) ✅

**Objetivo:** procesar el CSV de incidencias de pacientes (`incidents-healthcore.csv`) y producir el resumen de métricas definido en el BRIEFING.

### Deliverables

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `services/api/app/analyzer.py` | Lógica compartida: carga tolerante a delimitador, validación, métricas | ✅ |
| `scripts/analyze.py` | CLI: reporte formateado + export a `results.csv` | ✅ |
| `services/api/app/routers/incidents.py` | `POST /api/incidents/analyze`, `GET /api/incidents/results/export` | ✅ |
| `uis/backoffice/app/incidents/page.tsx` | Página de subida y visualización del análisis | ✅ |
| `incidents-healthcore.csv` | Input normalizado a comas (estándar del BRIEFING) | ✅ |
| `results.csv` | Output separado por comas (`metric,value,percentage`) | ✅ |

### Fix: verificación de CSV con delimitadores (2026-10-28)

- **Problema:** el parser estaba fijado a tabulaciones (`delimiter="\t"`). Los CSV separados por comas se leían como una sola columna → todos los registros marcados inválidos → reporte en 0.
- **Solución:** detección automática de delimitador con `try-except` (`csv.Sniffer` + fallbacks), mapeo de columnas por nombre de cabecera y reconstrucción de filas separadas por espacios (ancladas en el esquema).
- **Resultado:** acepta comas, tabulaciones y espacios; los tres formatos producen los valores exactos del BRIEFING (100 / 94 válidos / 6 inválidos, avg 3.58).
- **Input corregido:** se eliminó una columna fantasma inicial y se convirtió de tabs a comas.

---

## Propuesta de arquitectura de backend

| Entregable | Estado |
|------------|--------|
| [docs/ARCHITECTURE_PROPOSAL.md](../docs/ARCHITECTURE_PROPOSAL.md) | Borrador documental completado; pendiente de revisión y aprobación del CTO |

- Requisitos definidos por `prompt.md`; `CONTEXT-company.md` aporta contexto, sin ejecutar sus solicitudes del Talent Pipeline Tracker.
- Recomienda monolito modular FastAPI en capas, dominios, contratos API, separación frontend/backend, persistencia, autorización y auditoría.
- Incluye investigación oficial de FastAPI y Next.js, riesgos, evolución y decisiones pendientes.
- Verificados cobertura de requisitos, enlaces locales y cierre de bloques Markdown. No se implementó código ni se aprobaron nuevos ADRs.

---

## Próximos pasos previstos

1. **Mantenimiento del banco de memoria:**
   - Actualizar `progress.md` cada vez que el proyecto evolucione
   - Reflejar nuevas decisiones de arquitectura en `techContext.md`

2. **Nuevas features (módulos siguientes):**
   - Implementar agentes de IA en `agents/`
   - Crear skills reutilizables en `skills/`
   - Conectar MCP servers en `mcps/`
   - Automatizar flujos con n8n en `workflows/`

---

## Notas y decisiones registradas

| Fecha | Decisión |
|-------|----------|
| 2026-10-28 | **Fix Incident Analyzer:** parser de CSV tolerante a delimitador (comas/tabs/espacios) con detección automática + mapeo por nombre de columna; input `incidents-healthcore.csv` normalizado a comas; `results.csv` regenerado. |
| 2026-10-26 | **Fix backoffice:** la URL de la API (`http://localhost:8000` hardcodeada) se reemplazó por resolución dinámica en `uis/backoffice/lib/api.ts` + override `NEXT_PUBLIC_API_URL`. Funciona en local, Codespaces y despliegues (ADR-007). |
| 2026-10-14 | Borrador de propuesta de arquitectura backend creado en `docs/ARCHITECTURE_PROPOSAL.md`; nuevas decisiones pendientes de aprobación, sin cambios al backend |
| 2026-10-02 | Creación del banco de memoria (`memory-bank/`) con contexto de negocio, técnico y progreso |
| 2026-10-02 | Separación de configuración de agente (`.agents/`) vs código de producto (`agents/`, `skills/`) |
| 2026-10-02 | ADR-001 a ADR-006 documentados en techContext.md |
| 2026-10-02 | Paleta cromática HealthCore formalizada con clases `brand-50` a `brand-800` |
| 2026-10-02 | Migración completa de website a `uis/website/` con estructura bilingüe |
| 2026-10-02 | Creación de `uis/backoffice/` con dashboard de KPIs departamentales |
| 2026-10-02 | Creación y verificación de `services/api/` con 7 endpoints funcionales |
| 2026-10-02 | Fix: import `clinices` → `clinics` en main.py |
| 2026-10-02 | Fix: fuentes Geist → Google Inter en backoffice layout |