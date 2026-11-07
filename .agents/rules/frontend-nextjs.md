# Regla: Todo frontend debe usar Next.js

> **Alcance:** Siempre activa. Se aplica a cualquier interfaz de usuario del monorepo, especialmente a todo lo que se cree o modifique dentro de `uis/`.

## Requisito

Todo frontend nuevo o modificado debe implementarse como una aplicación **Next.js** (App Router), con **TypeScript/TSX**. Esto incluye el sitio público, aplicaciones internas, dashboards, portales y cualquier otra interfaz visible para una persona.

## Reglas de implementación

- ✅ Crear páginas y componentes React en archivos `.tsx` dentro de la aplicación Next.js correspondiente.
- ✅ Usar clases utilitarias de Tailwind CSS v4 para presentación y diseño.
- ✅ Mantener el HTML semántico dentro del JSX de los componentes Next.js cuando corresponda; esto no autoriza páginas `.html` independientes.
- ❌ No crear ni ampliar interfaces como páginas/archivos `.html` independientes.
- ❌ No escribir CSS personalizado: archivos `.css`, bloques `<style>` ni atributos/estilos inline.
- ❌ No cargar Tailwind desde CDN. Tailwind debe integrarse al build de Next.js mediante la configuración existente de PostCSS.
- ❌ No introducir frameworks alternativos para construir interfaces sin aprobación explícita.

## Código legado

Los archivos HTML, CSS o sitios estáticos existentes se consideran **legado**, no una excepción al estándar. No añadirles funcionalidades ni replicar su arquitectura en nuevas páginas. Cuando se requiera ampliar una interfaz heredada, hacerlo en Next.js; la migración/eliminación de los artefactos existentes puede realizarse como un cambio separado.

## Criterio de aceptación

Una nueva interfaz cumple esta regla si se ejecuta desde una aplicación Next.js, sus vistas y componentes están escritos en TSX y su presentación usa clases Tailwind sin CSS personalizado ni estilos inline.