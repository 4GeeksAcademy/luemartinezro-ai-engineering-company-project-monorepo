# AGENTS.md — HealthCore Monorepo

> Protocolo de operación para cualquier agente de IA que trabaje en este repositorio.
> Este archivo define qué leer antes de empezar, el flujo obligatorio antes de cada commit, y qué está prohibido modificar sin confirmación explícita.

---

## 1. Carga de contexto obligatoria

Al inicio de **cada sesión**, el agente DEBE leer los siguientes archivos en este orden:

### 1.1 Banco de memoria (`memory-bank/`)

| Orden | Archivo | Propósito |
|-------|---------|-----------|
| 1 | `memory-bank/projectbrief.md` | Contexto de negocio: qué es HealthCore, qué problema resuelve, objetivos del proyecto |
| 2 | `memory-bank/techContext.md` | Stack tecnológico, ADRs, restricciones regulatorias y técnicas, paleta de colores |
| 3 | `memory-bank/progress.md` | Estado actual del desarrollo, qué está completado, qué sigue, decisiones recientes |

### 1.2 Reglas de desarrollo (`.agents/`)

| Orden | Archivo | Propósito |
|-------|---------|-----------|
| 4 | `.agents/rules/*.md` | Reglas de desarrollo activas (con alcance: siempre, por patrón o por invocación) |

### 1.3 Contexto de empresa

| Orden | Archivo | Propósito |
|-------|---------|-----------|
| 5 | `CONTEXT.md` | Briefing completo de HealthCore — datos de dominio, departamentos, problemas, restricciones |
| 6 | `AGENTS.md` | Este archivo — el protocolo que estás leyendo ahora |

### 1.4 Documentación de carpeta destino

| Orden | Archivo | Propósito |
|-------|---------|-----------|
| 7 | `README.md` de la carpeta donde se va a trabajar | Convenciones específicas de esa capa del monorepo |

> ⚠️ **Regla:** Si el agente no ha leído todos estos archivos en la sesión actual, debe detenerse y leerlos antes de escribir cualquier código o proponer cambios. No se aceptan excepciones.

---

## 2. Flujo obligatorio antes de cada commit

El agente DEBE seguir estos **6 pasos** en orden antes de crear cualquier commit. Saltarse cualquiera de ellos requiere justificación explícita y confirmación del desarrollador.

### Paso 1: Verificar contexto
- ✅ Leer o releer los archivos de memoria (sección 1)
- ✅ Confirmar que se entiende el estado actual del proyecto (`progress.md`)
- ✅ Identificar qué carpeta/s aplican al cambio propuesto

### Paso 2: Planificar el cambio
- ✅ Redactar un plan breve (qué archivos se van a crear/modificar/eliminar y por qué)
- ✅ Verificar que el plan respeta las reglas de `.agents/rules/`
- ✅ Verificar que el plan no modifica archivos protegidos (sección 3)
- ✅ Presentar el plan al desarrollador si el cambio es significativo (nuevo componente, refactor, cambio de arquitectura)

### Paso 3: Implementar
- ✅ Escribir el código siguiendo las convenciones del proyecto
- ✅ Respetar la paleta cromática HealthCore (`brand-50` a `brand-800`)
- ✅ Usar Tailwind CSS vía CDN para la web pública — sin CSS personalizado ni estilos inline
- ✅ Seguir la estructura de carpetas del monorepo (no crear archivos sueltos en la raíz)
- ✅ Incluir comentarios y documentación inline donde sea necesario

### Paso 4: Verificar
- ✅ Revisar que el código no tiene errores de sintaxis
- ✅ Verificar que los componentes se renderizan correctamente
- ✅ Confirmar que los datos mostrados coinciden con `CONTEXT.md` (no inventar nombres, números o direcciones)
- ✅ Verificar que las reglas de `.agents/rules/` se cumplen
- ✅ Si aplica: probar que la navegación, formularios o flujos funcionan

### Paso 5: Documentar
- ✅ Actualizar `memory-bank/progress.md` si el cambio es significativo (nuevo componente, módulo, decisión)
- ✅ Añadir o actualizar README en la carpeta afectada si es un proyecto nuevo
- ✅ Si se tomó una decisión de arquitectura: añadir ADR en `techContext.md`

### Paso 6: Commit
- ✅ Mensaje de commit con prefijo semántico:
  - `feat:` — Nueva funcionalidad
  - `fix:` — Corrección de error
  - `docs:` — Documentación
  - `refactor:` — Refactorización sin cambio funcional
  - `test:` — Tests
  - `chore:` — Mantenimiento, configuraciones, dependencias
- ✅ Incluir en el mensaje un resumen del cambio y referencia al milestone si aplica
- ✅ No incluir múltiples cambios no relacionados en el mismo commit

---

## 3. Archivos y carpetas que no deben modificarse sin confirmación explícita

### 🛑 Zona roja — No modificar sin permiso del desarrollador

| Ruta | Razón |
|------|-------|
| `CONTEXT.md` | Fuente única de verdad de la empresa. Cualquier cambio aquí afecta a todos los agentes y aplicaciones. |
| `CONTEXT.en.md` | Versión en inglés del contexto de empresa. |
| `CONTEXT-company.md` | Contexto de milestones específicos. |
| `company-choice.md` | Reflexión personal del desarrollador sobre la elección de empresa. |
| `README.md` / `README.es.md` | Documentación raíz del template. Modificar requiere coordinación. |
| `package.json` (raíz) | Dependencias globales del monorepo. |
| `tsconfig.json` (raíz) | Configuración TypeScript global. |
| `vite.config.ts` (raíz) | Configuración de Vite global. |
| `uis/talent-pipeline-tracker/` | Proyecto completado del Hito 3. No modificar sin necesidad justificada. |
| `src/types/models.ts` | Modelos de dominio del Hito 2. No modificar sin impacto analizado. |

### ⚠️ Zona amarilla — Preguntar antes de eliminar o reestructurar

| Ruta | Condición |
|------|-----------|
| `index.html`, `index.es.html`, `application.html`, `application.es.html` | Archivos raíz del Hito 1. Se migrarán a `uis/website/` — no eliminar hasta que la migración esté completa y verificada. |
| `validation.js` | Lógica de validación compartida del Hito 1. No mover sin actualizar todas las referencias. |
| `README_MILESTONE1.md` | Documentación del Hito 1. Mantener como referencia histórica. |

### ✅ Zona verde — Modificable sin restricciones

| Ruta |
|------|
| `memory-bank/` (excepto `projectbrief.md` — cambios mayores requieren confirmación) |
| `.agents/` (reglas y skills) |
| `uis/website/` |
| `uis/backoffice/` |
| `services/api/` |
| `docs/` |
| Cualquier carpeta con README que indique "put here" o similar |

---

## 4. Skills disponibles

El agente DEBE revisar las skills disponibles en `.agents/skills/` y `skills/` antes de empezar una tarea recurrente. Si existe una skill que cubre la tarea, debe usarla.

| Ruta | Propósito |
|------|-----------|
| `.agents/skills/` | Skills para el agente de código (cómo trabajar en este repo) |
| `skills/` | Skills de producto (capacidades de IA para la empresa) |

---

## 5. Recordatorios importantes

- **No confundir `.agents/` con `agents/`**. `.agents/` es configuración del agente de desarrollo. `agents/` es código de producto (agentes de IA para HealthCore).
- **No inventar datos.** Usar exclusivamente los nombres, números, direcciones y datos de `CONTEXT.md`. Si un dato no está en el contexto, preguntar.
- **Los archivos bilingües son obligatorios** cuando la feature tiene contenido visible para pacientes. Inglés y español.
- **Actualizar el banco de memoria** después de cambios significativos. Si no se actualiza, pierde valor en días.