# 🎬 tipodan.github.io

Personal film diary, review site, and flight log. Single-page application that reads all content from JSON data files — no HTML generation needed.

## Live

[https://tipodan.github.io](https://tipodan.github.io)

## Architecture

```
tipodan.github.io/
├── index.html                      ← SPA shell (single entry point)
├── data/
│   ├── movies.json                 ← All movies, all years
│   ├── flights.json                ← All flights
│   ├── travel.json                 ← Travel photos by year
│   └── site.json                   ← Navigation config, airline logos/colors
├── assets/
│   ├── css/
│   │   └── main.css                ← Single unified stylesheet
│   ├── js/
│   │   ├── router.js               ← Hash-based SPA router
│   │   ├── app.js                  ← Data loading, nav rendering, view logic
│   │   └── flights.js              ← Flights module (tables + chart)
│   └── images/
│       ├── movies/
│       │   ├── 2024/               ← Posters for 2024
│       │   ├── 2025/               ← Posters for 2025
│       │   └── 2026/               ← Posters for 2026
│       ├── airlines/               ← Airline logo PNGs
│       ├── traviata.jpg            ← "Other" page image
│       └── favicon.ico
└── docs/
    └── webapp-architecture.md      ← Web app architecture proposal
```

## How it works

- `index.html` loads the router, flights module, and app script
- On page load, the app fetches the three JSON data files
- The hash router (`#/movies/2025/anora`, `#/flights`, etc.) determines which view to render
- Views are rendered by injecting HTML into `#main` — no page reloads
- Navigation is generated dynamically from the data (years auto-detected from movies.json)

## Routes

| Hash | View |
|------|------|
| `#/` | Home |
| `#/movies/:year` | Movie list for a year |
| `#/movies/:year/:slug` | Individual movie (poster) |
| `#/flights` | All flights (sortable, filterable table) |
| `#/flights/by-year` | Flights grouped by year (expandable) |
| `#/flights/airlines` | Airlines distribution (top 3 + bar chart) |
| `#/travel` | Travel photos grid by year |
| `#/other` | Miscellaneous page |

## Adding a new movie

Edit `data/movies.json` and add an entry:

```json
{ "year": 2026, "name": "My Movie", "slug": "my-movie" }
```

Then place the poster at `assets/images/movies/2026/my-movie.jpg`.

Posters are sourced from TMDB in original resolution (≥1000px wide). The workflow for finding and downloading posters is managed via AI assistant (see Kiro steering config).

## Adding a new year

Nothing to do. Just add movies with the new year number to `data/movies.json`. The navigation will automatically show the new year.

## Adding a new flight

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

## Adding a new airline

1. Add the logo PNG to `assets/images/airlines/<name>.png`
2. Add the logo filename and brand color to `data/site.json` under `airlineLogos` and `airlineColors`

## Airline logos

32×32 px favicons from each airline's website:

```
https://www.google.com/s2/favicons?sz=32&domain=<airline-domain>
```

## Local development

### Serving locally

```bash
cd /path/to/tipodan.github.io
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

### AI-assisted workflow

Content management (adding movies, downloading posters, generating thumbnails) is done via AI assistant (Kiro CLI). The workflow is defined in `.kiro/steering/tmdb-movies.md`.

```bash
cd /path/to/tipodan.github.io
kiro chat
```

Then ask to add movies — the assistant handles TMDB search, poster download, thumbnail generation, and JSON update.

## Tech stack

- HTML + CSS + vanilla JavaScript (no frameworks, no build step)
- Hash-based SPA router
- JSON data files as the single source of truth
- AI-assisted content management (posters via TMDB)
- Hosted on GitHub Pages

## Documentation

- [📐 Web App Architecture Proposal](./docs/webapp-architecture.md) — Plan para transformar el sitio en una aplicación web con backend, base de datos y panel de admin.

## Key design decisions

- **No build step** — edit JSON, push, done
- **No dependencies** — no jQuery, no bundler, no npm
- **Single source of truth** — all data in `data/` as JSON
- **One CSS file** — no scattered styles, no inline `<style>` blocks
- **Dynamic navigation** — add a year and it appears everywhere automatically
- **Zero HTML generation for movies** — the SPA renders from data at runtime
