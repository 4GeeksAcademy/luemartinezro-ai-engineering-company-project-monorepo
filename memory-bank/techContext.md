# Tech Context — HealthCore Digital

> Stack tecnológico, decisiones de arquitectura y restricciones técnicas del proyecto.

---

## 1. Stack tecnológico

### 1.1 Frontend — Todas las interfaces de usuario (`uis/`)

| Componente | Tecnología |
|-----------|-----------|
| **Framework** | Next.js 16 (App Router) para todo frontend nuevo o modificado |
| **Lenguaje** | TypeScript 5.x |
| **Estilos** | Tailwind CSS v4 + PostCSS, usando clases utilitarias |
| **Fuentes** | Geist (Geist Sans + Geist Mono) |
| **Presentación** | Componentes React en `.tsx`; no crear páginas HTML independientes ni escribir CSS personalizado |

> ⚠️ **Regla obligatoria:** Todo frontend debe implementarse en Next.js. No crear ni ampliar frontends como archivos `.html` independientes, ni usar CSS personalizado (archivos `.css`, bloques `<style>` o estilos inline). Usar componentes `.tsx` y clases utilitarias de Tailwind. Las páginas HTML/CSS heredadas son únicamente artefactos históricos; cualquier evolución funcional debe hacerse en Next.js.

### 1.2 Backend (`services/`)

| Componente | Tecnología |
|-----------|-----------|
| **Framework** | FastAPI (Python 3.11+) |
| **ORM / Base de datos** | Por definir según milestone |
| **Workers** | Por definir según necesidad |

### 1.3 Tipos compartidos

| Paquete | Ruta |
|---------|------|
| `@repo/shared-types` | `packages/shared/types/index.ts` |

---

## 2. Decisiones de arquitectura

### ADR-001: Monorepo con carpetas por responsabilidad

- **Contexto:** El proyecto abarca múltiples aplicaciones, servicios y agentes que comparten datos de dominio.
- **Decisión:** Usar un monorepo con carpetas de primer nivel que reflejan responsabilidades únicas (`uis/`, `services/`, `agents/`, `skills/`, `data/`, `infra/`, etc.).
- **Consecuencia:** Cada aplicación/service/agente tiene su propia subcarpeta con README, tests y configuración independiente.

### ADR-002: Next.js y Tailwind para todo frontend

- **Contexto:** Mantener una arquitectura uniforme, tipada y componible para todas las interfaces de usuario del monorepo.
- **Decisión:** Todo frontend nuevo o modificado se implementa con Next.js (App Router), TypeScript/TSX y Tailwind CSS integrado al build mediante PostCSS. No crear páginas frontend independientes en HTML ni escribir CSS personalizado o estilos inline.
- **Consecuencia:** La web pública y las aplicaciones internas siguen el mismo stack. Los archivos HTML/CSS existentes se consideran legado y no deben ampliarse; sus funcionalidades se migran a Next.js cuando corresponda.

### ADR-003: Next.js como framework estándar de frontend

- **Contexto:** Todas las interfaces requieren un framework común, incluso la web pública.
- **Decisión:** Usar Next.js 16 con App Router y TypeScript estricto para todas las aplicaciones frontend.
- **Consecuencia:** Se elimina la distinción de stack entre web pública estática y aplicaciones internas dinámicas.

### ADR-004: FastAPI como API centralizada

- **Contexto:** HealthCore necesita una API unificada que exponga datos de pacientes, citas, facturación y personal desde múltiples fuentes.
- **Decisión:** Implementar una única API FastAPI en `services/api/` con routers por dominio, evitando microservicios prematuros.
- **Consecuencia:** Un solo endpoint de entrada, fácil de desplegar y documentar con OpenAPI/Swagger.

### ADR-005: Banco de memoria como contexto activo

- **Contexto:** Los agentes de IA necesitan contexto persistente para no repetir errores entre sesiones.
- **Decisión:** Mantener `memory-bank/` con archivos `projectbrief.md`, `techContext.md`, `progress.md` que se actualizan tras cada cambio significativo.
- **Consecuencia:** Cada sesión de agente comienza leyendo estos archivos para tener contexto completo.

### ADR-006: Reglas de agente en `.agents/`

- **Contexto:** Los agentes de código (Cursor, Windsurf, Claude Code) necesitan convenciones explícitas para operar consistentemente.
- **Decisión:** Usar `.agents/rules/` para reglas de desarrollo (alcance siempre activo, por patrón o por invocación) y `.agents/skills/` para habilidades reutilizables con criterios de aceptación.
- **Consecuencia:** Separación clara entre configuración del agente (`.agents/`) y código de producto (`agents/`, `skills/`).

### ADR-007: URL de la API resuelta dinámicamente en el backoffice

- **Contexto:** El frontend `uis/backoffice/` tenía la URL del backend hardcodeada como `http://localhost:8000`, lo que rompía las llamadas a la API en GitHub Codespaces (el origen real es `https://<workspace>-8000.app.github.dev`).
- **Decisión:** Implementar `uis/backoffice/lib/api.ts` con un helper `getApiBase()` que resuelve la base de la API en este orden: (1) `NEXT_PUBLIC_API_URL` si está definida, (2) derivación automática del host reenviado de Codespaces desde el origen del frontend, (3) fallback local `http://localhost:8000`.
- **Consecuencia:** Las llamadas a `POST /api/incidents/analyze` y `GET /api/incidents/results/export` funcionan en local, Codespaces y despliegues sin recompilar ni hardcodear hosts. El override por variable de entorno permite fijar la URL por entorno (`docs/ARCHITECTURE_PROPOSAL.md` §9).

---

## 3. Restricciones técnicas

### 3.1 Regulatorias

| Normativa | Jurisdicción | Implicaciones |
|-----------|-------------|---------------|
| **HIPAA** | EE.UU. | Protección de datos sanitarios; obligación de auditoría de accesos; notificación de brechas |
| **UK GDPR** | Reino Unido | Consentimiento explícito; derecho al olvido; evaluación de impacto; DPO designado |
| **Leyes laborales** | EE.UU. / UK | Contratación, CME, despidos — marcos distintos en cada país |

**Consecuencias técnicas:**
- Todo sistema que gestione datos de pacientes debe registrar accesos (pista de auditoría).
- Los datos deben poder ser exportados/eliminados por solicitud del paciente.
- Los datos de EE.UU. y Reino Unido no deben mezclarse en el mismo almacenamiento sin cumplir ambos marcos.

### 3.2 De proyecto

- No hay presupuesto para servicios cloud adicionales — el backend se despliega localmente o en infraestructura proporcionada por el curso.
- Las APIs mock están desplegadas centralizadamente por el curso (ej: Talent Tracker API).
- El equipo de tecnología de HealthCore Digital es pequeño (6 personas) — mantener simplicidad es prioritario.

### 3.3 De estilo y convenciones

- **Paleta cromática HealthCore:**
  - `brand-50`: `#eefcff` (rgb 238,252,255)
  - `brand-100`: `#d6f6ff` (rgb 214,246,255)
  - `brand-200`: `#92eaff` (rgb 146,234,255)
  - `brand-300`: `#75d4ff` (rgb 117,212,255)
  - `brand-600`: `#0069ff` (rgb 0,105,255)
  - `brand-700`: `#0031c4` (rgb 0,49,196)
  - `brand-800`: `#0016a2` (rgb 0,22,162)
- **Tipografía:** Sistema GEIST (Geist Sans + Geist Mono) en Next.js. En web pública: sistema sans-serif del navegador.
- **Sombra de panel:** `0 20px 60px rgba(0, 22, 162, 0.14)` — clase `shadow-panel`.

### 3.4 De nomenclatura

| Convención | Aplicación |
|-----------|-----------|
| **Archivos bilingües** | Sufijo `.es.html` para español (ej: `index.es.html`) |
| **Ramas git** | `feature/<nombre>`, `fix/<nombre>` |
| **Commits** | Prefijo semántico: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:` |

---

## 4. Integraciones existentes

| Sistema | Propósito | Estado |
|---------|-----------|--------|
| **Talent Tracker API** | Backend de reclutamiento (mock) | `https://playground.4geeks.com/tracker/api/v1` |
| **Tailwind CSS + PostCSS** | Estilos de todos los frontends Next.js | Activo |
| **EHR EE.UU.** | Historia clínica (plataforma externa) | No integrada aún |
| **EHR Reino Unido** | Historia clínica (plataforma externa) | No integrada aún |

---

## 5. Rutas clave del monorepo

```
/ -> contiene páginas HTML heredadas; el frontend vigente debe implementarse en Next.js
├── .agents/          -> Reglas y skills para agentes de IA
├── memory-bank/      -> Banco de memoria del proyecto
├── uis/
│   ├── website/      -> Web pública corporativa (migrar legado HTML a Next.js)
│   └── backoffice/   -> Aplicación interna de administración
├── services/
│   └── api/          -> API FastAPI centralizada
├── src/              -> Utilidades TypeScript (collections, search, validations, transformations)
└── packages/
    └── shared/       -> Tipos compartidos (@repo/shared-types)
```