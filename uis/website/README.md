# HealthCore — Public Website

> **Ruta:** `uis/website/`  
> Sitio web público corporativo de HealthCore. Accesible en inglés y español.

---

## Tecnología

- **HTML5** semántico con landmarks (`header`, `nav`, `main`, `section`, `footer`)
- **Tailwind CSS v4** vía CDN (sin CSS personalizado, sin estilos inline)
- **JavaScript nativo** para validación de formularios (`validation.js`)
- **Schema.org** structured data (JSON-LD) para SEO

## Páginas

| Archivo | Idioma | Descripción |
|---------|--------|-------------|
| `index.html` | 🇬🇧 Inglés | Landing page corporativa |
| `index.es.html` | 🇪🇸 Español | Landing page corporativa |
| `application.html` | 🇬🇧 Inglés | Formulario de consulta del paciente |
| `application.es.html` | 🇪🇸 Español | Formulario de consulta del paciente |
| `validation.js` | — | Lógica de validación compartida (bilingüe) |

## Contenido

Todo el contenido refleja fielmente los datos de `CONTEXT.md` en la raíz del monorepo:
- 12 clínicas en EE.UU. y Reino Unido
- Servicios: primary care, specialist consultations, chronic disease management, preventive health
- Datos de contacto reales (teléfono, email, direcciones)

## Paleta cromática

| Clase | Color | Uso |
|-------|-------|-----|
| `brand-50` | `#eefcff` | Fondos muy claros |
| `brand-200` | `#92eaff` | Acentos, bordes |
| `brand-300` | `#75d4ff` | Acentos secundarios |
| `brand-600` | `#0069ff` | Elementos interactivos |
| `brand-700` | `#0031c4` | Hover, CTAs principales |
| `brand-800` | `#0016a2` | Títulos, marca, fondos oscuros |
| `shadow-panel` | `0 20px 60px rgba(0, 22, 162, 0.14)` | Sombras de paneles |

## Cómo ejecutar

```bash
# Desde la raíz del monorepo
npm run dev     # Arranca Vite en puerto 3000
npm run serve   # Alternativa con http-server
```

O directamente:

```bash
cd uis/website && npx --yes http-server . -p 3000
```

## Notas

- Las páginas en la raíz (`/index.html`, etc.) son la **versión original del Hito 1**. Estas páginas en `uis/website/` son la versión formal ubicada en la estructura correcta del monorepo.
- Para mantener compatibilidad, los archivos raíz se conservan hasta que se confirme la migración completa.