# Carpeta `uis`

Esta carpeta contiene **todos los proyectos con interfaz de usuario** para el proyecto transversal de AI Engineering de la compañía — por ejemplo: un sitio web público, un frontend de panel de administración, una interfaz de ecommerce, portales para clientes, aplicaciones Streamlit/Gradio u otras herramientas sólo-frontend.

Los dos proyectos principales que se almacenan aquí son:

- **`website`** — la presencia web pública de la compañía.
- **`backoffice`** — la aplicación interna de administración. Es el lugar ideal para desarrollar múltiples soluciones dentro de un mismo proyecto: autenticación, gestión de personas, gestión de operaciones, comunicación interna, **directorio de proveedores** y otras capacidades de back-office.

### Paneles y herramientas actuales

| Área | Ruta | Descripción |
|------|------|-------------|
| **Dashboard principal** | `/` | KPIs departamentales (Operaciones Clínicas, Acceso Paciente, Ciclo de Ingresos, Cumplimiento, Personas, Tecnología) |
| **Analizador de Incidentes** | `/incidents` | Subir/analizar CSVs de incidentes de pacientes, ver métricas y registros inválidos |
| **Directorio de Proveedores** | `/suppliers` | Gestión CRUD completa: tabla, filtros, formulario de registro, edición inline de tarifa, cambio de estado, eliminación |

Organiza `uis/` por **distintas áreas de la compañía** — cada subcarpeta agrupa un ámbito diferente (por ejemplo, web pública frente a operaciones internas) e incluye su propia documentación técnica y funcional.

- **Propósito principal**: centralizar en un único lugar todas las aplicaciones frontend que dan soporte a los casos de uso de la compañía.
- **Recomendación**: documenta en este archivo (o en sub-READMEs) las aplicaciones que vayas añadiendo, su objetivo, tecnología usada y cómo ejecutarlas.

> _These instructions are also available in [English](./README.md)._
