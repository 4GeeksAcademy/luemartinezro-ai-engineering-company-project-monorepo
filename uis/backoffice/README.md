# HealthCore — Backoffice

> Internal administration app for the HealthCore Digital team. The Backoffice is a protected frontend; the public company website is a separate app under `uis/website/`.

## Stack

- Next.js 16 App Router, React 19, TypeScript 5
- Tailwind CSS v4
- HealthCore Central API (`services/api/`) for authentication, profiles, incidents, suppliers, and other data

## Main routes

| Route | Description | Access |
|---|---|---|
| `/login` | Sign in with email and password | Public |
| `/register` | Create a user account | Public |
| `/` | Backoffice dashboard | Requires login |
| `/account/profile` | View/edit the signed-in user's profile | Requires login |
| `/incidents` | Incident analysis | Requires login |
| `/suppliers` | Supplier directory and management | Requires login |

## Run locally

Run the API and Backoffice in separate terminals. Install dependencies only inside the relevant service/app folders.

### 1. Start the API

```bash
cd services/api
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API health endpoint is [http://localhost:8000/health](http://localhost:8000/health); interactive API documentation is at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Start the Backoffice

```bash
cd uis/backoffice
npm install
npm run dev -- --hostname 0.0.0.0 --port 3000
```

Open [http://localhost:3000/login](http://localhost:3000/login). In GitHub Codespaces, open the forwarded **port 3000** URL from the Ports panel.

### API proxy configuration

Browser requests go to the same-origin `/api/healthcore/...` path. Next.js proxies these requests to the API server, avoiding browser access to a separate Codespaces API port. By default, the proxy targets `http://127.0.0.1:8000`.

- `POST /api/incidents/analyze` — subir CSV y obtener el resumen
- `GET /api/incidents/results/export` — descargar el último análisis en CSV
- `POST /auth/login` — iniciar sesión (email + password → JWT)
- `POST /users` — crear una cuenta estándar y perfil inicial opcional (el formulario no permite elegir roles)
- `GET /profiles/me` — cargar y volver a leer el perfil autenticado
- `PUT /profiles/me` — actualizar los datos del perfil autenticado
- `POST /auth/forgot-password` — solicitar email de reset de contraseña
- `POST /auth/reset-password` — cambiar contraseña con token de un solo uso
- `POST /auth/change-password` — cambiar contraseña estando autenticado
- `GET /suppliers` — listar proveedores (con filtros opcionales)
- `POST /suppliers` — crear proveedor
- `GET /suppliers/{id}` — detalle de proveedor
- `PATCH /suppliers/{id}/rate` — actualizar tarifa
- `PATCH /suppliers/{id}/status` — actualizar estado
- `DELETE /suppliers/{id}` — eliminar proveedor

```bash
HEALTHCORE_API_URL=https://api.example.com npm run dev -- --hostname 0.0.0.0 --port 3000
```

Do not set `NEXT_PUBLIC_API_URL` to a port-forwarded Codespaces URL for this setup; the browser must use the same-origin proxy.

## Test authentication

A development test account is available in the current development database:

```bash
cp .env.example .env.local
# editar NEXT_PUBLIC_API_URL si es necesario
# configurar NEXT_PUBLIC_WEBSITE_URL si el sitio público está en otro host
```

El enlace al sitio público usa `NEXT_PUBLIC_WEBSITE_URL` si se define; por defecto,
deriva el puerto 3002 en localhost y Codespaces. Para despliegues con otro dominio,
configure esta variable al compilar la imagen de Backoffice.

### Ejecución conjunta (local)

The account is stored in the API's local development database. If it is not present in a fresh database, create an account from `/register` instead. Registration requires a valid email and a password of at least 6 characters; the page displays API validation errors when a request fails. The API assigns newly registered accounts the default `user` role; the test account above has the `admin` role.

> These credentials are for local development/testing only. Do not use them in a deployed environment or store real sensitive information in the development database.

## Authentication behavior

En Codespaces, los helpers reemplazan el puerto del hostname actual por el puerto
reenviado de destino (8000 para API y 3002 para web pública). Si los frontends tienen
dominios distintos, configure `NEXT_PUBLIC_WEBSITE_URL` explícitamente.

## Supplier directory

The `/suppliers` page supports listing, filtering, registration, rate/status updates, and deletion through the API. API errors are displayed in the UI.
