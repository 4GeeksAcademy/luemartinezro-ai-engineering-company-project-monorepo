# HealthCore — Backoffice

> **Ruta:** `uis/backoffice/`  
> Aplicación interna de administración para el equipo de HealthCore Digital.

---

## Propósito

Panel de control interno (dashboard) para que los responsables de cada departamento de HealthCore puedan monitorizar KPIs operativos, acceder a herramientas internas y gestionar datos de la red de clínicas.

## Tecnología

- **Next.js 16** (App Router)
- **TypeScript** 5.x
- **Tailwind CSS** v4 + PostCSS
- **Geist** fonts (Geist Sans + Geist Mono)

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard principal con KPIs de todos los departamentos |
| *(más rutas según se desarrollen módulos)* | |

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
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd uis/backoffice
npm run dev
```

En Codespaces, GitHub reenvía ambos puertos (3000 y 8000) automáticamente; el helper deriva el host reenviado del backend desde el origen del frontend.

## Notas

- El layout es independiente del sitio web público (`uis/website/`). Cada uno tiene su propio header, navegación y footer.
- Los datos mostrados provienen de `CONTEXT.md` — no se inventan métricas.
- Este proyecto está preparado para crecer con nuevos módulos: pacientes, citas, facturación, cumplimiento, RR.HH.