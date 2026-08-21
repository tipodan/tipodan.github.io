# 🚀 Propuesta: Transformación a aplicación web con backend

## Objetivo

Transformar el sitio estático actual (JSON + imágenes locales) en una aplicación web con:
- Base de datos para películas y vuelos
- Almacenamiento de imágenes en la nube
- Panel de administración con login
- Frontend que consume una API

---

## Arquitectura propuesta

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  (mismo SPA actual, adaptado para consumir API)             │
│  Hosting: Vercel / Netlify / GitHub Pages                   │
└────────────────────────┬────────────────────────────────────┘
                         │ fetch /api/*
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND (API)                          │
│  Framework: Node.js + Express  ó  Python + FastAPI          │
│  Hosting: Railway / Render / Fly.io                         │
│                                                             │
│  Endpoints:                                                 │
│    GET  /api/movies              ← lista pública            │
│    GET  /api/movies/:year        ← filtrado por año         │
│    GET  /api/flights             ← lista pública            │
│    GET  /api/site                ← config nav/airlines      │
│    POST /api/auth/login          ← login admin              │
│    POST /api/movies              ← crear película (auth)    │
│    PUT  /api/movies/:id          ← editar (auth)            │
│    DELETE /api/movies/:id        ← borrar (auth)            │
│    POST /api/movies/:id/poster   ← subir imagen (auth)     │
│    POST /api/flights             ← crear vuelo (auth)       │
└────────────┬──────────────────────────────────┬─────────────┘
             │                              │
             ▼                              ▼
┌────────────────────────┐    ┌────────────────────────────┐
│      BASE DE DATOS     │    │   ALMACENAMIENTO IMÁGENES  │
│                        │    │                            │
│  PostgreSQL o SQLite   │    │  S3 / Cloudflare R2 /     │
│  (Supabase / Neon)     │    │  Supabase Storage          │
│                        │    │                            │
│  Tablas:               │    │  Bucket:                   │
│  - movies              │    │  /movies/2024/slug.jpg     │
│  - flights             │    │  /movies/2025/slug.jpg     │
│  - site_config         │    │  /airlines/ryanair.png     │
│  - users (admin)       │    │                            │
└────────────────────────┘    └────────────────────────────┘
```

---

## Stack recomendado

| Componente | Opción recomendada | Alternativa | Por qué |
|---|---|---|---|
| Backend | **FastAPI** (Python) | Express (Node) | Ya se usa Python en el generador, tipado, async, docs auto |
| Base de datos | **Supabase (PostgreSQL)** | SQLite + Litestream | Tier gratis generoso, auth integrado, storage |
| Imágenes | **Supabase Storage** | Cloudflare R2 / S3 | Integrado con la DB, CDN, tier gratis 1GB |
| Auth | **JWT con bcrypt** | Supabase Auth | Solo se necesita 1 usuario admin |
| Frontend hosting | **Vercel** | GitHub Pages | Preview deploys, headers, redirects |
| Backend hosting | **Railway** | Render / Fly.io | Free tier, deploy desde Git |

---

## Modelo de datos

```sql
CREATE TABLE movies (
  id          SERIAL PRIMARY KEY,
  year        INTEGER NOT NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  poster_url  TEXT,              -- URL en el bucket de imágenes
  is_moty     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, slug)
);

CREATE TABLE flights (
  id          SERIAL PRIMARY KEY,
  route       TEXT NOT NULL,
  from_city   TEXT NOT NULL,
  from_code   TEXT NOT NULL,
  to_city     TEXT NOT NULL,
  to_code     TEXT NOT NULL,
  date        DATE,
  year        INTEGER NOT NULL,
  airline     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE airlines (
  id          SERIAL PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  logo_url    TEXT,
  color       TEXT              -- hex color
);

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
```

---

## Cambios en el frontend

| Actual | Nuevo |
|---|---|
| `fetch('./data/movies.json')` | `fetch('https://api.tipodan.dev/api/movies')` |
| `fetch('./data/flights.json')` | `fetch('https://api.tipodan.dev/api/flights')` |
| `fetch('./data/site.json')` | `fetch('https://api.tipodan.dev/api/site')` |
| Imágenes en `./assets/images/movies/...` | URLs del CDN: `https://storage.supabase.co/...` |
| No hay login | Nueva ruta `#/admin` con formulario de login |
| No hay panel | Ruta `#/admin/movies` para CRUD de películas |

El SPA público sigue funcionando exactamente igual — solo cambian las URLs de origen de datos.

---

## Panel de administración

Nueva sección accesible en `#/admin`:

1. **Login** — usuario + contraseña → JWT almacenado en sessionStorage
2. **Listado de películas** — tabla editable con botón "Añadir"
3. **Formulario de película** — nombre, año, poster (drag & drop), checkbox "Movie of the Year"
4. **Listado de vuelos** — tabla con botón "Añadir"
5. **Formulario de vuelo** — todos los campos del vuelo

El panel reemplaza al `tools/generator.py` — se pueden añadir películas desde el móvil.

---

## Flujo de subida de película (admin)

```
Admin rellena formulario → POST /api/movies (name, year, slug)
                         → POST /api/movies/:id/poster (multipart file)
                              ↓
                         Backend redimensiona imagen (Pillow/sharp)
                         Sube a Supabase Storage
                         Guarda poster_url en DB
                              ↓
                         Frontend público hace fetch → ve la película nueva
```

---

## Seguridad

- Solo 1 usuario admin, no se necesita registro público
- JWT con expiración de 24h, refresh opcional
- Endpoints `POST/PUT/DELETE` protegidos con middleware de auth
- CORS configurado solo para el dominio del sitio
- Rate limiting en login (prevenir brute force)
- Imágenes validadas por tipo MIME y tamaño máximo (5MB)

---

## Costes estimados (tier gratuito)

| Servicio | Free tier | Suficiente |
|---|---|---|
| Supabase | 500MB DB, 1GB storage, 2GB transfer | ✅ Sobra |
| Railway | $5 crédito/mes, 512MB RAM | ✅ Sobra |
| Vercel | 100GB bandwidth | ✅ Sobra |
| **Total** | **$0/mes** | Para este volumen de uso |

---

## Esfuerzo estimado de implementación

| Tarea | Tiempo aprox |
|---|---|
| Configurar Supabase (DB + Storage + Auth) | 1-2h |
| Backend API (FastAPI + endpoints CRUD) | 4-6h |
| Migrar datos actuales (JSON → DB, imágenes → Storage) | 1h |
| Adaptar frontend para consumir API | 1-2h |
| Panel de admin (login + CRUD películas/vuelos) | 4-6h |
| Deploy y configuración | 1-2h |
| **Total** | **~12-18h** |

---

## Decisiones pendientes

1. **¿Supabase todo-en-uno o servicios separados?** — Supabase da DB + Storage + Auth en un solo sitio. Más simple. Si se prefiere más control, se puede ir con PostgreSQL en Railway + S3.

2. **¿Panel admin en el mismo SPA o app separada?** — Recomendación: en el mismo SPA con rutas `#/admin/*` protegidas. Menos infraestructura.

3. **¿Python (FastAPI) o Node (Express)?** — Dado que ya se usa Python para el generador, FastAPI es la opción natural. Pero si se prefiere todo JS, Express también funciona.

4. **¿Cache estático para datos públicos?** — Se podría tener un endpoint que genere un `movies.json` estático en cada cambio (como un "publish"), así el frontend sigue cargando un archivo estático ultra-rápido sin depender de que la API esté online. Esto da lo mejor de ambos mundos.
