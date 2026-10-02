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

## Notas

- El layout es independiente del sitio web público (`uis/website/`). Cada uno tiene su propio header, navegación y footer.
- Los datos mostrados provienen de `CONTEXT.md` — no se inventan métricas.
- Este proyecto está preparado para crecer con nuevos módulos: pacientes, citas, facturación, cumplimiento, RR.HH.