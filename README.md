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
│       │   └── 2025/               ← Posters for 2025
│       ├── airlines/               ← Airline logo PNGs
│       ├── traviata.jpg            ← "Other" page image
│       └── favicon.ico
└── tools/
    └── generator.py                ← GUI to add movies (updates JSON + copies poster)
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
| `#/other` | Miscellaneous page |

## Adding a new movie

Run the GUI generator:

```bash
cd tools
python3 generator.py
```

This will:
1. Copy the poster to `assets/images/movies/<year>/<slug>.jpg`
2. Add the entry to `data/movies.json`

That's it — no HTML regeneration. The SPA picks it up immediately.

### Adding manually

Edit `data/movies.json` and add an entry:

```json
{ "year": 2025, "name": "My Movie", "slug": "my-movie" }
```

Then place the poster at `assets/images/movies/2025/my-movie.jpg`.

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

## Tech stack

- HTML + CSS + vanilla JavaScript (no frameworks, no build step)
- Hash-based SPA router
- JSON data files as the single source of truth
- Python GUI for adding movies (optional convenience)
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
