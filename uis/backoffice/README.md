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

For an API hosted elsewhere, set the server-side environment variable `HEALTHCORE_API_URL` before starting Next.js, for example:

```bash
HEALTHCORE_API_URL=https://api.example.com npm run dev -- --hostname 0.0.0.0 --port 3000
```

Do not set `NEXT_PUBLIC_API_URL` to a port-forwarded Codespaces URL for this setup; the browser must use the same-origin proxy.

## Test authentication

A development test account is available in the current development database:

- **Email:** `admin@healthcore.com`
- **Password:** `password123`

1. Start the API and Backoffice using the commands above.
2. Open `/login` and enter the test email and password.
3. Confirm you reach the dashboard and the navigation shows the signed-in user.
4. Open `/account/profile`, verify the account details, and try updating the optional profile fields.
5. Log out, then try to open `/account/profile` directly. The app should send you to the login page.

The account is stored in the API's local development database. If it is not present in a fresh database, create an account from `/register` instead. Registration requires a valid email and a password of at least 6 characters; the page displays API validation errors when a request fails. The API assigns newly registered accounts the default `user` role; the test account above has the `admin` role.

> These credentials are for local development/testing only. Do not use them in a deployed environment or store real sensitive information in the development database.

## Authentication behavior

- The JWT is stored in browser `localStorage` and sent as a Bearer token for protected API requests.
- Protected views redirect unauthenticated users to `/login`.
- A 401 response clears the stored token and sends the user to login.
- Profile updates use `PUT /profiles/me`.

## Supplier directory

The `/suppliers` page supports listing, filtering, registration, rate/status updates, and deletion through the API. API errors are displayed in the UI.
