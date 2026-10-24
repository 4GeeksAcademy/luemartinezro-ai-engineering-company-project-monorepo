# HealthCore Central API

> **Ruta:** `services/api/`  
> API centralizada de HealthCore, construida con FastAPI + TinyDB + JWT Auth.

---

## Propósito

Proporcionar una API unificada que exponga datos de pacientes, citas, facturación, clínicas y personal de HealthCore, consumiendo desde los sistemas EHR existentes y sirviendo a los frontends (web pública, backoffice, talent pipeline tracker).

---

## Stack

| Componente | Tecnología |
|-----------|------------|
| Framework | **FastAPI** (Python 3.14+) |
| Autenticación | JWT stateless (`python-jose` + `bcrypt`) |
| Base de datos | TinyDB (usuarios y perfiles) |
| Datos de negocio | En memoria (clínicas, departamentos) |
| Configuración | `pydantic-settings` + `.env` |
| Documentación | Swagger UI (OpenAPI) en `/docs` |
| Ejecución | `uvicorn app.main:app --reload` |

---

## Arquitectura: Monolito modular por capas

La API sigue una **arquitectura en capas** dentro de un **monolito modular**, donde cada dominio de negocio vive en su propio módulo con separación clara de responsabilidades.

```
┌─────────────────────────────────────────────────────────────┐
│                     FASTAPI APPLICATION                      │
├─────────────────────────────────────────────────────────────┤
│                     main.py (composición)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    ROUTER LAYER                          │ │
│  │  (Contratos HTTP, validación, dependencias de seguridad) │ │
│  │                                                          │ │
│  │  /auth     /users    /profiles   /clinics   /departments │ │
│  └────────────────────────┬────────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────────┐ │
│  │                   SERVICE LAYER                          │ │
│  │   (Reglas de negocio, transiciones, coordinación)        │ │
│  │                                                          │ │
│  │  AuthService  UserService  ProfileService                │ │
│  └────────────────────────┬────────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────────┐ │
│  │                 REPOSITORY LAYER                         │ │
│  │   (Persistencia — TinyDB para User/Profile)              │ │
│  │                                                          │ │
│  │  UserRepository  ProfileRepository                       │ │
│  └────────────────────────┬────────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────────┐ │
│  │              INFRASTRUCTURE / CORE LAYER                 │ │
│  │   (Seguridad, configuración, errores, base de datos)    │ │
│  │                                                          │ │
│  │  settings.py  security.py  errors.py  tinydb.py          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────┐
         │        PERSISTENCIA          │
         │                              │
         │  TinyDB ── users.json        │
         │        ── profiles.json      │
         │                              │
         │  Memoria ── clinics, depts   │
         └──────────────────────────────┘
```

### Capas

| Capa | Responsabilidad |
|------|----------------|
| **Router** | Valida contratos HTTP, aplica dependencias (`get_current_user`), invoca servicios y mapea respuestas |
| **Service** | Contiene las reglas de negocio: hashing de contraseñas, verificación de duplicados, autorización por rol |
| **Repository** | Operaciones CRUD contra TinyDB; encapsula el acceso a datos |
| **Core** | Configuración tipada (`settings.py`), seguridad JWT y bcrypt (`security.py`), excepciones reutilizables (`errors.py`), instancia de TinyDB (`tinydb.py`) |

### Flujo de autenticación

```
Cliente                    API (FastAPI)
  │                           │
  │  POST /auth/login         │
  │  {email, password}        │
  │ ───────────────────────►  │
  │                           ├── AuthService.authenticate()
  │                           │     ├── UserRepository.get_by_email()
  │                           │     └── bcrypt.checkpw()
  │                           ├── create_access_token(subject=user_id)
  │  ◄─────────────────────── │
  │  {access_token,           │
  │   token_type: "bearer"}   │
  │                           │
  │  GET /clinics             │
  │  Authorization:           │
  │  Bearer <token>           │
  │ ───────────────────────►  │
  │                           ├── Depends(get_current_user)
  │                           │     ├── decode_access_token()
  │                           │     ├── UserRepository.get_by_id()
  │                           │     └── verifica is_active
  │                           ├── (ruta protegida continúa)
  │  ◄─────────────────────── │
  │  200 OK + datos           │
```

---

## Estructura del proyecto

```
services/api/
├── .env                          # Variables de entorno local
├── .env.example                  # Plantilla de variables de entorno
├── pyproject.toml                # Proyecto Python (uv)
├── uv.lock                       # Lock de dependencias
├── requirements.txt              # Dependencias legacy
├── README.md                     # Este archivo
├── data/
│   └── tinydb.json               # Base de datos TinyDB (auto-creada)
└── app/
    ├── __init__.py
    ├── main.py                   # Composición: CORS, routers, health check
    ├── data.py                   # Datos en memoria (clínicas, departamentos)
    │
    ├── core/                     # ▲ Capa transversal
    │   ├── __init__.py
    │   ├── settings.py           # Config tipada (pydantic-settings + .env)
    │   ├── security.py           # bcrypt, JWT create/decode, get_current_user
    │   └── errors.py             # Helpers HTTPException (401, 403, 404, 409)
    │
    ├── db/                       # ▲ Capa de persistencia
    │   ├── __init__.py
    │   └── tinydb.py             # Singleton TinyDB + get_table()
    │
    ├── modules/                  # ▲ Módulos de negocio (Router → Service → Repository)
    │   ├── auth/                 # Autenticación JWT
    │   │   ├── schemas.py        # LoginRequest, TokenResponse, AuthMeResponse
    │   │   ├── service.py        # Lógica de login
    │   │   └── router.py         # POST /auth/login, GET /auth/me
    │   │
    │   ├── users/                # Gestión de credenciales
    │   │   ├── schemas.py        # UserCreate, UserUpdate, UserResponse, UserRole
    │   │   ├── repository.py     # TinyDB: insert, get, update, delete
    │   │   ├── service.py        # CRUD + hash + validaciones + auto-creación perfil
    │   │   └── router.py         # POST/GET/PUT/DELETE /users
    │   │
    │   └── profiles/             # Perfiles vinculados 1:1 a usuarios
    │       ├── schemas.py        # ProfileCreate, ProfileUpdate, ProfileResponse
    │       ├── repository.py     # TinyDB: operaciones por user_id
    │       ├── service.py        # Lógica de perfil + auto-creación
    │       └── router.py         # GET/PUT /profiles/me
    │
    ├── models/                   # Schemas compartidos (legacy)
    │   ├── __init__.py
    │   └── schemas.py            # ClinicLocation, Department, HealthResponse
    │
    └── routers/                  # Routers legacy (ahora protegidos)
        ├── __init__.py
        ├── clinics.py            # Endpoints protegidos con Depends(get_current_user)
        └── departments.py        # Endpoints protegidos con Depends(get_current_user)
```

---

## Endpoints

### Sistema (público)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check (`{"status":"ok","version":"0.2.0"}`) |

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/auth/login` | ❌ | Validar credenciales y obtener JWT |
| `GET` | `/auth/me` | ✅ | Email, rol y perfil del usuario autenticado |

### Usuarios

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| `POST` | `/users` | ❌ | — | Registrar usuario (acepta campos opcionales de perfil) |
| `GET` | `/users` | ✅ | admin, manager | Listar todos los usuarios |
| `GET` | `/users/{id}` | ✅ | admin, self | Obtener usuario por ID |
| `PUT` | `/users/{id}` | ✅ | admin, self | Actualizar credenciales |
| `DELETE` | `/users/{id}` | ✅ | admin | Eliminar usuario + perfil vinculado |

### Perfiles

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/profiles/me` | ✅ | Perfil del usuario autenticado |
| `PUT` | `/profiles/me` | ✅ | Actualizar nombre, teléfono y dirección |

### Clínicas (protegidas)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/clinics` | ✅ | Listar todas las clínicas (9 US + 3 UK) |
| `GET` | `/clinics/{id}` | ✅ | Detalle de una clínica |
| `GET` | `/clinics/country/{country}` | ✅ | Clínicas por país (`US` / `GB`) |

### Departamentos (protegidos)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/departments` | ✅ | Listar departamentos con responsables y KPIs |
| `GET` | `/departments/{id}` | ✅ | Detalle de un departamento |
| `GET` | `/departments/{id}/kpis` | ✅ | KPIs de un departamento |

---

## Modelo de datos

### User (TinyDB — tabla `users`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `int` | Doc ID asignado por TinyDB |
| `email` | `str` | Email único del usuario |
| `hashed_password` | `str` | Hash bcrypt de la contraseña |
| `role` | `str` | `admin` / `manager` / `user` |
| `is_active` | `bool` | Estado de la cuenta |
| `created_at` | `str` | ISO 8601 timestamp de creación |

### Profile (TinyDB — tabla `profiles`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `int` | Doc ID asignado por TinyDB |
| `user_id` | `int` | FK al ID del usuario en TinyDB |
| `name` | `str` | Nombre visible |
| `phone` | `str` | Teléfono de contacto |
| `address` | `str` | Dirección postal |

---

## Seguridad

- **JWT stateless** — no se usan sesiones ni cookies
- **Contraseñas hasheadas** con bcrypt — nunca se almacenan en texto plano
- **Token JWT** firmado con HS256; contiene `sub` (user_id), `iat` y `exp`
- **Expiración configurable** mediante variable de entorno `ACCESS_TOKEN_EXPIRE_MINUTES`
- **Protección por rol** — acceso restringido según `admin`, `manager` o `user`
- **Todas las rutas de negocio protegidas** — solo `/health`, `/auth/login` y `POST /users` son públicas
- **401** para solicitudes no autenticadas; **403** para acceso no autorizado; **409** para conflictos (email duplicado)

---

## Prerrequisitos

- Python 3.14+
- [uv](https://docs.astral.sh/uv/) (gestor de paquetes)

---

## Cómo ejecutar

```bash
# 1. Ir al directorio de la API
cd services/api

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores deseados

# 3. Instalar dependencias (con uv)
uv sync

# 4. Iniciar servidor
uv run uvicorn app.main:app --reload --port 8000
```

La documentación interactiva estará disponible en:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Flujo completo de autenticación (verificación)

```bash
# 1. Registrar un usuario
curl -s -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthcore.com","password":"secret123","role":"admin","name":"Admin User","phone":"+1-512-000-0000","address":"1100 Trinity St, Austin TX"}'

# 2. Iniciar sesión (obtener token)
curl -s -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthcore.com","password":"secret123"}'

# 3. Usar el token en una ruta protegida
TOKEN="<token-del-paso-2>"
curl -s http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 4. Sin token → 401
curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:8000/clinics
# → 401
```

---

## Pruebas rápidas (endpoints legacy - ahora protegidos)

```bash
# Health check (público)
curl http://localhost:8000/health

# Obtener token primero
TOKEN=$(curl -s -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthcore.com","password":"secret123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Listar clínicas (protegido)
curl http://localhost:8000/clinics \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Clínicas en Reino Unido (protegido)
curl http://localhost:8000/clinics/country/GB \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# KPIs de Compliance (protegido)
curl http://localhost:8000/departments/compliance/kpis \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `JWT_SECRET_KEY` | Clave secreta para firmar JWT | `change-me-in-production` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos de validez del token | `30` |
| `JWT_ALGORITHM` | Algoritmo de firma JWT | `HS256` |
| `TINYDB_PATH` | Ruta al archivo JSON de TinyDB | `./data/tinydb.json` |
| `CORS_ORIGINS` | Orígenes permitidos (CORS) | `*` |

---

## Datos de negocio

Todos los datos servidos por la API provienen de `CONTEXT.md` en la raíz del monorepo:
- 12 clínicas (9 US, 3 UK) con direcciones, teléfonos y horarios reales
- 7 departamentos con responsables, KPIs y problemas documentados
- Métricas operativas (no-show rate, denial rate, tiempo de contratación, etc.)

Los datos de **usuarios y perfiles** se almacenan exclusivamente en **TinyDB** (tablas `users` y `profiles` dentro de `data/tinydb.json`).

---

## Documentación

- `docs/ARCHITECTURE_PROPOSAL.md` — Propuesta de arquitectura detallada (monolito modular, capas, decisiones técnicas)
- `CONTEXT.md` — Briefing completo de HealthCore
- `memory-bank/` — Project brief, technical context y progreso