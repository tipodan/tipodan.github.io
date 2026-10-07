# 🎬 tipodan.github.io

Personal film diary, review site, and flight log. Single-page application that reads all content from JSON data files — no HTML generation needed.

## Table of contents

### Overview
- [🔗 Live](#-live)
- [🏗️ Architecture](#️-architecture)
- [⚙️ How it works](#️-how-it-works)
- [🧭 Routes](#-routes)
- [🛠️ Tech stack](#️-tech-stack)
- [🧩 Key design decisions](#-key-design-decisions)

### Content management
- [🎞️ Adding a new movie](#️-adding-a-new-movie)
- [📅 Adding a new year](#-adding-a-new-year)
- [✈️ Adding a new flight](#️-adding-a-new-flight)
- [🛫 Adding a new airline](#-adding-a-new-airline)
- [🖼️ Airline logos](#️-airline-logos)
- [🌍 Adding a moment (photo)](#-adding-a-moment-photo)

### Training
- [🏋️ Training — workout log](#️-training--workout-log)

### Development
- [💻 Local development](#-local-development)

### Reference
- [📚 Documentation](#-documentation)

---

## 🔗 Live

[https://tipodan.github.io](https://tipodan.github.io)

## 🏗️ Architecture

```
tipodan.github.io/
├── index.html                      ← SPA shell (single entry point)
├── data/
│   ├── movies.json                 ← All movies, all years
│   ├── flights.json                ← All flights
│   ├── moments.json                ← Moments photos, grouped by year
│   └── site.json                   ← Navigation config, airline logos/colors
├── assets/
│   ├── css/
│   │   └── main.css                ← Single unified stylesheet
│   ├── js/
│   │   ├── router.js               ← Hash-based SPA router
│   │   ├── app.js                  ← Data loading, nav rendering, view logic
│   │   ├── flights.js              ← Flights module (tables + chart)
│   │   ├── btc.js                  ← BTC widget/module
│   │   └── training.js             ← Training module (workout log, reads + session registration via Supabase)
│   └── images/
│       ├── movies/
│       │   ├── 2024/               ← Posters for 2024
│       │   ├── 2025/               ← Posters for 2025
│       │   └── 2026/               ← Posters for 2026
│       ├── airlines/               ← Airline logo PNGs
│       ├── moments/
│       │   ├── 2022/               ← Moments photos for 2022
│       │   ├── 2025/               ← Moments photos for 2025
│       │   └── 2026/               ← Moments photos for 2026
│       ├── traviata.jpg            ← "Other" page image
│       └── favicon.ico
└── docs/
    ├── webapp-architecture.md      ← Web app architecture proposal (movies/flights backend — future)
    └── workout-log-schema.md       ← Workout log relational schema (Training module, Supabase)
```

## ⚙️ How it works

- `index.html` loads the router, flights/training modules, and app script
- On page load, the app fetches the JSON data files
- The hash router (`#/movies/2025/anora`, `#/flights`, `#/training/data`, etc.) determines which view to render
- Views are rendered by injecting HTML into `#main` — no page reloads
- Navigation is generated dynamically from the data (years auto-detected from movies.json)
- Most content is static JSON. The **Training** module is the exception: it reads from a Supabase (PostgreSQL) backend and can also write workout sessions back to it (see [Training](#️-training--workout-log))

## 🧭 Routes

| Hash | View |
|------|------|
| `#/` | Home |
| `#/movies/:year` | Movie list for a year |
| `#/movies/:year/:slug` | Individual movie (poster) |
| `#/flights` | All flights (sortable, filterable table) |
| `#/flights/by-year` | Flights grouped by year (expandable) |
| `#/flights/airlines` | Airlines distribution (top 3 + bar chart) |
| `#/moments` | Moments photo gallery grouped by year |
| `#/btc` | BTC widget |
| `#/training/data` | Workout log table (sessions, filters, progress chart) |
| `#/training/plan` | Workout templates (plan) grouped by workout |
| `#/training/register` | Register a session (create new, or auto-resume the open one) |
| `#/training/:exercise` | Workout log filtered by exercise (progress chart) |
| `#/other` | Miscellaneous page |

## 🛠️ Tech stack

- HTML + CSS + vanilla JavaScript (no frameworks, no build step)
- Hash-based SPA router
- JSON data files as the single source of truth for static content (movies, flights, moments, site config)
- Supabase (PostgreSQL + PostgREST) as the backend for the Training module (reads and session writes)
- Chart.js (CDN) for charts (flights distribution, training progress)
- `@supabase/supabase-js` (CDN) for the Training data access
- AI-assisted content management (posters via TMDB)
- Hosted on GitHub Pages

## 🧩 Key design decisions

- **No build step** — edit JSON, push, done
- **No dependencies** — no jQuery, no bundler, no npm
- **Single source of truth** — all data in `data/` as JSON
- **One CSS file** — no scattered styles, no inline `<style>` blocks
- **Dynamic navigation** — add a year and it appears everywhere automatically
- **Zero HTML generation for movies** — the SPA renders from data at runtime

---

## 🎞️ Adding a new movie

Edit `data/movies.json` and add an entry:

```json
{ "year": 2026, "name": "My Movie", "slug": "my-movie" }
```

Then place the poster at `assets/images/movies/2026/my-movie.jpg`.

Posters are sourced from TMDB in original resolution (≥1000px wide). The workflow for finding and downloading posters is managed via AI assistant (see Kiro steering config).

## 📅 Adding a new year

Nothing to do. Just add movies with the new year number to `data/movies.json`. The navigation will automatically show the new year.

## ✈️ Adding a new flight

Edit `data/flights.json` and add an entry:

```json
{
  "route": "MAD-LIS",
  "from": "Madrid",
  "fromCode": "MAD",
  "to": "Lisboa",
  "toCode": "LIS",
  "date": "2026-05-10",
  "year": 2026,
  "airline": "Iberia"
}
```

## 🛫 Adding a new airline

1. Add the logo PNG to `assets/images/airlines/<name>.png`
2. Add the logo filename and brand color to `data/site.json` under `airlineLogos` and `airlineColors`

## 🖼️ Airline logos

32×32 px favicons from each airline's website:

```
https://www.google.com/s2/favicons?sz=32&domain=<airline-domain>
```

## 🌍 Adding a moment (photo)

Edit `data/moments.json` and add a photo under the matching year (create the
year block if it does not exist):

```json
{
  "year": 2026,
  "photos": [
    { "src": "assets/images/moments/2026/my-kuala-lumpur-01.jpg", "alt": "Torres Petronas, Kuala Lumpur 2026" }
  ]
}
```

Place the image at `assets/images/moments/<year>/<cc>-<place>-NN.jpg`, where `<cc>` is the two-letter country code (ISO 3166-1 alpha-2, lowercase). Any resolution works — images are cropped to a square via `object-fit: cover`. The full workflow is managed via AI assistant (see Kiro steering config, `moments-images.md`).

---

## 🏋️ Training — workout log

Unlike the rest of the site (static JSON), the Training module is backed by a **Supabase (PostgreSQL)** database accessed directly from the browser via `@supabase/supabase-js` and the PostgREST API. The data model (exercises, workouts, workout_exercises, sessions, exercise_sets) is documented in [workout-log-schema.md](./docs/workout-log-schema.md).

### Views

Training is a single top-level nav item with a submenu (like Flights), pointing to three dedicated views:

- `#/training/data` — all recorded sessions as a table (one row per session+exercise, dynamic "Set N" columns). Click a date or exercise to filter; filtering by exercise shows an average-weight progress chart.
- `#/training/plan` — the workout templates (which exercises make up each workout) with their planned sets.
- `#/training/register` — a dedicated view to register a workout session (see below).
- `#/training/:exercise` — the Data table pre-filtered by an exercise (used by the Plan page links).

`#/training` redirects to `#/training/data`; the old `#/plan` redirects to `#/training/plan`.

### Registering a session (write path)

The **Register** view (`#/training/register`) records a workout session:

1. Pick a workout and a date (defaults to today) and press **Guardar** → a row is inserted into `sessions`.
2. The workout's exercises appear, each with a grid of **3 sets** (reps + weight).
3. **Guardar sesión** upserts the filled sets into `exercise_sets` (can be pressed multiple times to keep saving as you go). Only sets with a reps value are saved; an empty weight means bodyweight (`NULL`).
4. **Cerrar sesión** performs a final save, stamps the session's `finished_at`, and returns to the Data view.

Sets are upserted on the `UNIQUE(session_id, exercise_id, set_number)` constraint (`Prefer: resolution=merge-duplicates`), so re-saving updates the existing series instead of duplicating them. The `sessions` table has a `finished_at TIMESTAMPTZ` column (NULL = not closed yet) that is set when the session is closed.

### Resuming an open session

A session is "open" while its `finished_at` is NULL (i.e. you saved sets but did not press "Cerrar sesión"). When you open the **Register** view (`#/training/register`), the module checks for the most recent open session and, if one exists, **resumes it automatically**: the workout/date step is skipped, the exercises are reloaded and the already-saved sets are prefilled into the grid. If no session is open, the view starts a new one.

### Supabase access and RLS

The frontend uses the **public anon key** (safe to expose) with Row Level Security. The required policies are:

- `SELECT` on all read tables (sessions, exercise_sets, workouts, workout_exercises, exercises).
- `INSERT` on `sessions` and `exercise_sets` (to create sessions and their sets).
- `UPDATE` on `exercise_sets` (so re-saving a session upserts/updates existing sets).
- `UPDATE` on `sessions` (so closing a session can stamp `finished_at`).

> ⚠️ **Security note:** because the anon key is public, every policy opened to the `anon` role is open to anyone who visits the site. The current setup allows anonymous INSERT (sessions, sets) and UPDATE (sets and sessions). It intentionally does **not** open DELETE on any table. If this database holds anything that must be protected, move writes behind Supabase Auth (`authenticated` role) instead of `anon`.

---

## 💻 Local development

### Serving locally

```bash
cd /path/to/tipodan.github.io
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

### AI-assisted workflow

Content management is done mostly via AI assistant (Kiro CLI). The assistant follows the steering files in `.kiro/steering/`, which encode the conventions and step-by-step workflows for each content type:

| Steering file | Covers |
|---------------|--------|
| `.kiro/steering/project-overview.md` | Project mental model loaded every session: architecture, routes, stack, data files |
| `.kiro/steering/tmdb-movies.md` | Adding movies: TMDB search, poster download, thumbnail generation, `movies.json` update |
| `.kiro/steering/moments-images.md` | Adding Moments photos: image analysis, naming convention (`<cc>-<place>-NN.jpg`), folder layout, `moments.json` update |
| `.kiro/steering/project-docs.md` | Keeping `README.md` and `project-overview.md` in sync when structure, routes, or workflows change |

```bash
cd /path/to/tipodan.github.io
kiro chat
```

Then just describe what you want to add, for example:

- *"Add movie X to 2026"* — the assistant searches TMDB, downloads the poster, generates the thumbnail, and updates `movies.json` (see `tmdb-movies.md`).
- *"Add this photo to Moments under 2025"* — the assistant analyzes the image, proposes a file name, moves/renames it, and updates `moments.json` (see `moments-images.md`).

The assistant asks for confirmation before downloading posters or moving/renaming images, and updates `README.md` whenever the folder structure or a workflow changes.

---

## 📚 Documentation

- [📐 Web App Architecture Proposal](./docs/webapp-architecture.md) — Plan para transformar el sitio en una aplicación web con backend, base de datos y panel de admin.
- [🏋️ Workout Log — Diseño de base de datos](./docs/workout-log-schema.md) — Esquema relacional para registrar entrenamientos: ejercicios, rutinas, sesiones y series.
