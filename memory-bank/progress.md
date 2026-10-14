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
- Tailwind CSS vía CDN para estilos (sin CSS personalizado)
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