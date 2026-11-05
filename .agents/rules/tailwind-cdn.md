# Rule: Use Tailwind CSS via CDN — No custom CSS, no inline styles

> **Alcance:** Siempre activa (se aplica a todas las páginas de la web pública de HealthCore)

---

## Descripción

Todo el estilo visual de las páginas HTML estáticas de HealthCore (la web pública corporativa) debe implementarse exclusivamente con **Tailwind CSS cargado desde CDN**. No se permite la creación de archivos CSS personalizados ni el uso de atributos `style` inline en los elementos HTML.

## Aplicación

- ✅ **Cargar Tailwind desde CDN:**
  ```html
  <script src="https://cdn.tailwindcss.com"></script>
  ```

- ✅ **Configurar la paleta HealthCore inline:**
  ```html
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#eefcff',
              100: '#d6f6ff',
              200: '#92eaff',
              300: '#75d4ff',
              600: '#0069ff',
              700: '#0031c4',
              800: '#0016a2'
            }
          },
          boxShadow: {
            panel: '0 20px 60px rgba(0, 22, 162, 0.14)'
          }
        }
      }
    };
  </script>
  ```

- ✅ **Usar clases utilitarias de Tailwind** para todo el estilo: `bg-brand-200`, `text-brand-800`, `rounded-2xl`, `shadow-panel`, etc.
- ✅ **Múltiples archivos HTML** pueden compartir la misma configuración de Tailwind (cada uno declara su propio `<script>` de configuración).

## Prohibiciones

- ❌ **No crear archivos CSS personalizados** (`.css` files in `/css/` or similar).
- ❌ **No usar el atributo `style`** en elementos HTML (`<div style="color: red;">`).
- ❌ **No incluir bloques `<style>`** en el `<head>` con reglas CSS propias.
- ❌ **No sobreescribir clases de Tailwind** con CSS adicional.

## Excepciones

- Las **aplicaciones internas** (`uis/backoffice/`, `uis/talent-pipeline-tracker/`) que usan Next.js con PostCSS + Tailwind como parte del build toolchain **NO están sujetas a esta regla**. En esos proyectos, Tailwind se configura a través de `tailwind.config.ts` o `postcss.config.mjs` según corresponda.

## Razón

1. **Simplicidad:** Sin paso de compilación CSS. Las páginas estáticas se sirven directamente.
2. **Consistencia:** Todos los desarrolladores y agentes usan el mismo conjunto de clases.
3. **Mantenibilidad:** Sin archivos CSS dispersos que gestionar.
4. **Rendimiento:** Tailwind CDN aplica solo las clases utilizadas (purge automático en producción).