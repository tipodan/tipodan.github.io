# Project Overview — tipodan.github.io

## What this is
Personal film diary, review site, and flight log. A single-page application (SPA) that reads all content from JSON data files. There is no build step, no dependencies, and no HTML generation — the SPA renders everything from data at runtime.

## Project location
/mnt/c/Users/eteodan/workspace/GITHUB/tipodan.github.io-main

## Live
https://tipodan.github.io (hosted on GitHub Pages)

## Architecture
```
tipodan.github.io/
├── index.html                      ← SPA shell (single entry point)
├── data/
│   ├── movies.json                 ← All movies, all years
│   ├── flights.json                ← All flights
│   ├── moments.json                ← Moments photos, grouped by year
│   └── site.json                   ← Navigation config, airline logos/colors
├── assets/
│   ├── css/main.css                ← Single unified stylesheet
│   ├── js/
│   │   ├── router.js               ← Hash-based SPA router
│   │   ├── app.js                  ← Data loading, nav rendering, view logic
│   │   ├── flights.js              ← Flights module (tables + chart)
│   │   └── btc.js                  ← BTC widget/module
│   └── images/
│       ├── movies/<year>/          ← Posters, with thumbs/<slug>.jpg subfolder
│       ├── airlines/               ← Airline logo PNGs
│       ├── moments/<year>/         ← Moments photos
│       └── traviata.jpg            ← "Other" page image
└── docs/
    └── webapp-architecture.md      ← Proposal to move to a backend + DB + admin
```

## How it works
- `index.html` loads the router, flights module, and app script.
- On load, the app fetches the JSON data files under `data/`.
- The hash router (e.g. `#/movies/2025/anora`, `#/flights`) decides which view to render.
- Views render by injecting HTML into `#main` — no page reloads.
- Navigation is generated dynamically from data (years auto-detected from `movies.json`).

## Routes
| Hash | View |
|------|------|
| `#/` | Home |
| `#/movies/:year` | Movie list for a year |
| `#/movies/:year/:slug` | Individual movie (poster) |
| `#/flights` | All flights (sortable, filterable table) |
| `#/flights/by-year` | Flights grouped by year (expandable) |
| `#/flights/airlines` | Airlines distribution (top 3 + bar chart) |
| `#/moments` | Moments photo gallery grouped by year |
| `#/other` | Miscellaneous page |

## Tech stack
- HTML + CSS + vanilla JavaScript (no frameworks, no build step)
- Hash-based SPA router
- JSON data files as the single source of truth
- AI-assisted content management (posters via TMDB)
- Hosted on GitHub Pages

## Key design decisions
- **No build step** — edit JSON, push, done.
- **No dependencies** — no jQuery, no bundler, no npm.
- **Single source of truth** — all data in `data/` as JSON.
- **One CSS file** — no scattered styles, no inline `<style>` blocks.
- **Dynamic navigation** — add a year and it appears everywhere automatically.
- **Zero HTML generation for movies** — the SPA renders from data at runtime.

## Data files quick reference
- `movies.json` — array of `{ "year", "name", "slug" }` (optionally `is_moty`/flag for Movie of the Year).
- `flights.json` — array of flight objects (`route`, `from`, `fromCode`, `to`, `toCode`, `date`, `year`, `airline`).
- `moments.json` — array of year groups, each with a `photos` array of `{ "src", "alt" }`.
- `site.json` — navigation config plus `airlineLogos` and `airlineColors` maps.

## Related steering files
- `tmdb-movies.md` — full workflow for adding movies (TMDB search, poster download, thumbnail, `movies.json`).
- `moments-images.md` — full workflow for adding Moments photos (analysis, naming, folders, `moments.json`).
- `project-docs.md` — rules for keeping `README.md` and this overview in sync.

## Local development
```bash
cd /mnt/c/Users/eteodan/workspace/GITHUB/tipodan.github.io-main
python3 -m http.server 8000
# open http://localhost:8000
```
