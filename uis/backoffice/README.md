# HealthCore — Backoffice

> **Ruta:** `uis/backoffice/`  
> Aplicación interna de administración para el equipo de HealthCore Digital.

---

## Propósito

Panel de control interno (dashboard) para que los responsables de cada departamento de HealthCore puedan monitorizar KPIs operativos, acceder a herramientas internas y gestionar datos de la red de clínicas y **proveedores**.

## Tecnología

- **Next.js 16** (App Router)
- **TypeScript** 5.x
- **Tailwind CSS** v4 + PostCSS
- **Geist** fonts (Geist Sans + Geist Mono)

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard principal con KPIs de todos los departamentos |
| `/incidents` | Análisis de incidentes de pacientes |
| `/suppliers` | **Directorio de proveedores** — gestión completa (CRUD, filtros, cambios de estado y tarifa) |

## Dashboard — KPIs mostrados

Los datos reflejan fielmente la situación actual de HealthCore descrita en `CONTEXT.md`:

| Departamento | Responsable | Métrica clave |
|-------------|-------------|---------------|
| 🏥 Operaciones Clínicas | Dr. Marcus Reid | 120 clínicos, 35 min/día en documentación |
| 🗓️ Paciente y Acceso | Priya Nair | 22% no-show rate (~$1.8M/año) |
| 💰 Ciclo de Ingresos | Tom Callahan | 14% denail rate (vs 5-8% industria) |
| 🔒 Cumplimiento | Claire Whitfield | HIPAA + UK GDPR |
| 👥 Personas | Diane Foster | 47 días avg. to hire |
| 💻 Tecnología | James Osei | 2 EHR systems, sin capa compartida |

---

## Supplier Directory — Directorio de Proveedores

Página `/suppliers` que permite al equipo de procurement gestionar los proveedores de HealthCore.

### Funcionalidades

| Funcionalidad | Descripción | Endpoint consumido |
|--------------|-------------|-------------------|
| **Listado completo** | Tabla con nombre, país (con bandera), categorías, tarifa, estado y acciones. | `GET /suppliers` |
| **Filtros** | Controles desplegables por país (`US`/`UK`) y categoría. La lista se actualiza sin recargar la página. | `GET /suppliers?country=&category=` |
| **Registro** | Formulario con validación cliente-side y consumo de la API. Muestra el error devuelto por la API (422) si la validación falla. | `POST /suppliers` |
| **Actualizar tarifa** | Edición inline: clic en el botón `$`, edita el valor y confirma con ✓. Se actualiza el timestamp automáticamente. | `PATCH /suppliers/{id}/rate` |
| **Cambiar estado** | Botón por fila que alterna entre `active` y `suspended`. Confirmación visual inmediata tras respuesta de la API. | `PATCH /suppliers/{id}/status` |
| **Eliminar** | Botón 🗑 con confirmación (`confirm()`) antes de enviar el DELETE. | `DELETE /suppliers/{id}` |

### Visualización de estados

- **Active** — ✅ badge verde `bg-green-100 text-green-800`
- **Suspended** — ⛔ badge rojo `bg-red-100 text-red-700`
- Las filas de proveedores suspendidos tienen fondo `bg-gray-50/50` para distinguirlas visualmente.

### Formulario de registro

Campos incluidos:
- **Supplier name** (text, required, min 2 caracteres)
- **Country** (select: US / UK, required)
- **Contract rate** (number, step 0.01, min 0.01, required)
- **Initial status** (select: Active / Suspended, default: Active)
- **Product categories** (checkboxes,至少要 seleccionar una)
- Validación cliente-side antes de enviar a la API; si la API responde con error, se muestra el mensaje en un banner rojo.

---

## Cómo ejecutar

```bash
cd uis/backoffice
npm install
npm run dev
```

El servidor de desarrollo arrancará en `http://localhost:3000`.

## Configuración de la API de backend

El frontend del backoffice consume la **HealthCore Central API** (`services/api/`) en las rutas:

- `POST /api/incidents/analyze` — subir CSV y obtener el resumen
- `GET /api/incidents/results/export` — descargar el último análisis en CSV
- `GET /suppliers` — listar proveedores (con filtros opcionales)
- `POST /suppliers` — crear proveedor
- `GET /suppliers/{id}` — detalle de proveedor
- `PATCH /suppliers/{id}/rate` — actualizar tarifa
- `PATCH /suppliers/{id}/status` — actualizar estado
- `DELETE /suppliers/{id}` — eliminar proveedor

### Resolución dinámica de la URL (sin `localhost` hardcodeado)

La URL base de la API se resuelve automáticamente en `lib/api.ts` según el entorno:

1. **Override explícito:** si `NEXT_PUBLIC_API_URL` está definida, se usa esa URL.
2. **GitHub Codespaces:** se deriva del origen actual (`https://<workspace>-8000.app.github.dev`).
3. **Local (fallback):** `http://localhost:8000`.

Para forzar una URL concreta:

```bash
cp .env.example .env.local
# editar NEXT_PUBLIC_API_URL si es necesario
```

### Ejecución conjunta (local)

```bash
# Terminal 1 — backend
cd services/api
uv run uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd uis/backoffice
npm run dev
```

En Codespaces, GitHub reenvía ambos puertos (3000 y 8000) automáticamente; el helper deriva el host reenviado del backend desde el origen del frontend.

## Notas

- El layout es independiente del sitio web público (`uis/website/`). Cada uno tiene su propio header, navegación y footer.
- Los datos mostrados provienen de `CONTEXT.md` y `Company-BRIEFING.md` — no se inventan métricas.
- La página de suppliers está disponible desde el menú de navegación principal del backoffice.
- Este proyecto está preparado para crecer con nuevos módulos: pacientes, citas, facturación, cumplimiento, RR.HH.