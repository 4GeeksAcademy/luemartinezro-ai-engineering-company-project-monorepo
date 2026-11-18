# HealthCore — Backoffice

> Aplicación interna de administración para el equipo de HealthCore Digital. El Backoffice es una interfaz protegida; el sitio público de la compañía es una aplicación separada en `uis/website/`.

## Tecnologías

- Next.js 16 App Router, React 19 y TypeScript 5
- Tailwind CSS v4
- HealthCore Central API (`services/api/`) para autenticación, perfiles, incidentes, proveedores y otros datos

## Rutas principales

| Ruta | Descripción | Acceso |
|---|---|---|
| `/login` | Iniciar sesión con email y contraseña | Pública |
| `/register` | Crear una cuenta de usuario | Pública |
| `/` | Dashboard del Backoffice | Requiere iniciar sesión |
| `/account/profile` | Ver/editar el perfil del usuario autenticado | Requiere iniciar sesión |
| `/incidents` | Análisis de incidentes | Requiere iniciar sesión |
| `/suppliers` | Directorio y gestión de proveedores | Requiere iniciar sesión |

## Ejecución local

Ejecuta la API y el Backoffice en terminales separadas. Instala las dependencias únicamente dentro de la carpeta del servicio o de la aplicación correspondiente.

### 1. Iniciar la API

```bash
cd services/api
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El endpoint de estado de la API está en [http://localhost:8000/health](http://localhost:8000/health); la documentación interactiva está en [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Iniciar el Backoffice

```bash
cd uis/backoffice
npm install
npm run dev -- --hostname 0.0.0.0 --port 3000
```

Abre [http://localhost:3000/login](http://localhost:3000/login). En GitHub Codespaces, abre la URL del **puerto 3000** reenviado desde el panel Ports.

### Configuración del proxy de API

Las peticiones del navegador usan la ruta del mismo origen `/api/healthcore/...`. Next.js las reenvía al servidor de API, evitando que el navegador tenga que acceder a un puerto separado de Codespaces. Por defecto, el proxy apunta a `http://127.0.0.1:8000`.

Si la API está alojada en otro lugar, configura la variable de entorno del servidor `HEALTHCORE_API_URL` antes de iniciar Next.js. Por ejemplo:

```bash
HEALTHCORE_API_URL=https://api.example.com npm run dev -- --hostname 0.0.0.0 --port 3000
```

Para esta configuración, no establezcas `NEXT_PUBLIC_API_URL` con una URL de puerto reenviado de Codespaces: el navegador debe usar el proxy del mismo origen.

## Probar la autenticación

Hay una cuenta de prueba para la base de datos de desarrollo actual:

- **Email:** `admin@healthcore.com`
- **Contraseña:** `password123`

1. Inicia la API y el Backoffice con los comandos anteriores.
2. Abre `/login` e introduce el email y la contraseña de prueba.
3. Confirma que llegas al dashboard y que la navegación muestra al usuario autenticado.
4. Abre `/account/profile`, comprueba los datos de la cuenta y prueba a actualizar los campos opcionales del perfil.
5. Cierra sesión e intenta abrir `/account/profile` directamente. La aplicación debe redirigirte al login.

La cuenta está guardada en la base de datos local de desarrollo de la API. Si no existe en una base nueva, crea otra cuenta desde `/register`. El email debe ser válido y la contraseña debe tener al menos 6 caracteres; si una petición falla, la página muestra el error devuelto por la API. Las cuentas nuevas reciben el rol `user` por defecto; la cuenta de prueba anterior tiene el rol `admin`.

> Estas credenciales son solo para desarrollo y pruebas locales. No las uses en un entorno desplegado ni guardes información sensible real en la base de datos de desarrollo.

## Comportamiento de autenticación

- El JWT se guarda en `localStorage` del navegador y se envía como token Bearer en las peticiones protegidas a la API.
- Las vistas protegidas redirigen a `/login` si el usuario no está autenticado.
- Una respuesta 401 elimina el token guardado y redirige al login.
- Las actualizaciones de perfil usan `PUT /profiles/me`.

## Directorio de proveedores

La página `/suppliers` permite listar, filtrar, registrar proveedores, actualizar tarifas y estados, y eliminar proveedores mediante la API. Los errores de la API se muestran en la interfaz.
