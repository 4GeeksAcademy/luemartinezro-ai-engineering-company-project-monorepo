# Skill: Audit HealthCore Web Page

> **Skill ID:** `website-audit`  
> **Versión:** 1.0.0  
> **Categoría:** Calidad / Cumplimiento  
> **Alcance:** Web pública de HealthCore (`uis/website/`, raíz)

---

## Objetivo

Verificar que una página web HTML de HealthCore cumple con los estándares de **marca, accesibilidad, reglas técnicas y corrección de contenido** definidos en el banco de memoria del proyecto. Esta skill se ejecuta después de crear o modificar cualquier página HTML estática de la web pública.

---

## Inputs

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `pagePath` | `string` | Ruta absoluta o relativa al archivo HTML a auditar | ✅ |
| `isBilingual` | `boolean` | Si la página tiene versión en ambos idiomas (EN + ES) | ✅ |
| `partnerPagePath` | `string` | Ruta al archivo del otro idioma (si `isBilingual = true`) | ⬜ |
| `expectedTitle` | `string` | Título esperado de la página (opcional, para verificación) | ⬜ |
| `checkSeo` | `boolean` | Si se deben verificar metadatos SEO y Schema.org | ⬜ (default: true) |

### Ejemplo de input

```json
{
  "pagePath": "uis/website/index.html",
  "isBilingual": true,
  "partnerPagePath": "uis/website/index.es.html",
  "expectedTitle": "HealthCore | Outpatient Care Across the US",
  "checkSeo": true
}
```

---

## Procedimiento

El agente debe ejecutar los siguientes checks en orden. **Todos deben pasar** para que la página sea aceptada.

### Check 1: Estructura y tecnología
- [ ] El archivo existe y es un HTML5 válido (`<!DOCTYPE html>`)
- [ ] Incluye `<script src="https://cdn.tailwindcss.com"></script>` en el `<head>`
- [ ] Incluye configuración de Tailwind con la paleta `brand` completa (50, 100, 200, 300, 600, 700, 800)
- [ ] Incluye la clase `shadow-panel` con el valor `0 20px 60px rgba(0, 22, 162, 0.14)`
- [ ] No contiene archivos CSS personalizados vinculados
- [ ] No contiene atributos `style` inline
- [ ] No contiene bloques `<style>` con reglas CSS propias

### Check 2: Contenido y marca
- [ ] El contenido refleja fielmente los datos de `CONTEXT.md` (no inventa nombres, direcciones, números)
- [ ] Usa colores de la paleta `brand` (no colores arbitrarios)
- [ ] Incluye el logo/marca "HC" con fondo `bg-brand-800`
- [ ] Incluye navegación principal con enlaces funcionales
- [ ] El footer incluye copyright y enlaces a redes sociales (si aplica)

### Check 3: Bilingüismo (si `isBilingual = true`)
- [ ] Existe el archivo del idioma asociado (`partnerPagePath`)
- [ ] El archivo asociado tiene la misma estructura y contenido traducido
- [ ] Todos los labels, mensajes de error, placeholders y botones están traducidos
- [ ] Los enlaces de cambio de idioma apuntan al archivo correcto
- [ ] Los atributos `lang` en `<html>` son correctos (`en`, `es`)

### Check 4: Accesibilidad (si `checkSeo = true`)
- [ ] Incluye `lang` en la etiqueta `<html>`
- [ ] Incluye `<title>` descriptivo
- [ ] Incluye `<meta name="description">`
- [ ] Usa landmarks semánticos (`<header>`, `<nav>`, `<main>`, `<footer>`)
- [ ] Los elementos interactivos tienen `aria-label` o texto descriptivo
- [ ] Las imágenes (si existen) tienen `alt` text

### Check 5: Schema.org (si `checkSeo = true`)
- [ ] Incluye `application/ld+json` con `MedicalOrganization`
- [ ] Los datos estructurados coinciden con `CONTEXT.md`
- [ ] Incluye `areaServed: ["US", "GB"]` si aplica

### Check 6: Validación y formularios (si aplica)
- [ ] Los campos de formulario tienen `label` con `for` y `id` correspondientes
- [ ] Los mensajes de error son visibles y están localizados
- [ ] La validación del lado cliente funciona (si existe `validation.js`)

---

## Output esperado

```json
{
  "skill": "website-audit",
  "version": "1.0.0",
  "auditedAt": "2026-10-02",
  "pagePath": "uis/website/index.html",
  "passed": true,
  "checks": {
    "structure": { "passed": true, "errors": [] },
    "content": { "passed": true, "errors": [] },
    "bilingual": { "passed": true, "errors": [] },
    "accessibility": { "passed": true, "errors": [] },
    "schema": { "passed": true, "errors": [] },
    "forms": { "passed": true, "errors": [] }
  },
  "summary": "Todos los checks pasados correctamente."
}
```

Si algún check falla, `passed` será `false` y el campo `errors` contendrá la lista de incumplimientos.

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | **Página HTML válida** | El archivo se parsea sin errores. Usar validador HTML5 o inspección visual. |
| 2 | **Sin CSS personalizado** | No existe ningún archivo `.css` vinculado ni bloques `<style>` en el HTML. |
| 3 | **Sin estilos inline** | `grep 'style=\"' <pagePath>` no devuelve resultados. |
| 4 | **Tailwind CDN presente** | La URL `https://cdn.tailwindcss.com` aparece exactamente en el `<head>`. |
| 5 | **Paleta HealthCore completa** | Las 7 variantes de `brand` (50, 100, 200, 300, 600, 700, 800) están definidas en la configuración de Tailwind. |
| 6 | **Datos fieles a CONTEXT.md** | Ningún nombre, dirección, teléfono o dato inventado. Si se encuentra un dato no verificado en CONTEXT.md, el check falla. |
| 7 | **Bilingüismo correcto** | Ambos archivos existen, tienen la misma estructura, y todo el texto visible está traducido. |
| 8 | **Metadatos SEO** | `title`, `meta description`, y `lang` están presentes y son correctos. |
| 9 | **Schema.org presente** | Contiene al menos un bloque `application/ld+json` con `MedicalOrganization` o `MedicalClinic`. |
| 10 | **Salida documentada** | El resultado de la auditoría se registra (en el output de la sesión o en un archivo) para trazabilidad. |

---

## Notas

- Esta skill aplica solo a la **web pública estática** (`uis/website/`). Las aplicaciones Next.js usan su propio toolchain y no están sujetas a la regla de Tailwind CDN.
- Si la página es nueva (no bilingüe), el check de bilingüismo se omite con `isBilingual = false`.
- Los criterios de aceptación **deben ser verificables automáticamente** (grep, regex, validación de estructura). Si un criterio no puede verificarse con herramientas, no es un buen criterio.
- Actualizar esta skill si cambian los requisitos de marca o tecnología.