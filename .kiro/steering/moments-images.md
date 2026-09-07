# Adding Images to the Moments Section

## Project location
/mnt/c/Users/eteodan/workspace/GITHUB/tipodan.github.io-main

## Overview
The Moments section (`#/moments`) is a photo gallery grouped by year. All
content comes from `data/moments.json`; images live under
`assets/images/moments/<year>/`. The SPA renders years in descending order and
shows each photo in a square 3-column grid with a fullscreen (blurred) viewer.

## Workflow for adding an image

1. Identify the source image (usually provided in the project root).
2. Analyze the image to determine the place and country it shows.
3. **MANDATORY: propose the file name to the user and wait for confirmation**
   before moving/renaming. Also confirm the target year if it is not obvious.
4. Create the year folder if it does not exist:
   `assets/images/moments/<year>/`
5. Move and rename the image into that folder following the naming convention.
6. Add an entry to `data/moments.json` under the matching year (create the year
   block if it does not exist yet).
7. Verify: the JSON is valid and the image responds when served locally.
8. Update `README.md` if a new year folder was created (images tree).

## File naming convention
`<cc>-<place>-NN.jpg`

- `<cc>` — two-letter country code (ISO 3166-1 alpha-2), lowercase.
  Examples: `es` (Spain), `my` (Malaysia), `pt` (Portugal), `no` (Norway).
- `<place>` — descriptive place slug: lowercase, ASCII only (strip accents),
  spaces/special chars → hyphens. Usually a city or landmark.
- `NN` — two-digit sequence starting at `01`, incremented for additional
  photos of the same place/trip.

Examples:
- `assets/images/moments/2026/my-kuala-lumpur-01.jpg`
- `assets/images/moments/2025/es-fuerteventura-01.jpg`

## data/moments.json structure
Array of year groups, each with a `photos` array. Order does not matter for
rendering (the view sorts years descending), but keep years in descending
order for readability.

```json
[
  {
    "year": 2026,
    "photos": [
      { "src": "assets/images/moments/2026/my-kuala-lumpur-01.jpg", "alt": "Torres Petronas, Kuala Lumpur 2026" }
    ]
  },
  {
    "year": 2025,
    "photos": [
      { "src": "assets/images/moments/2025/es-fuerteventura-01.jpg", "alt": "Fuerteventura 2025" }
    ]
  }
]
```

- `src` — path relative to the project root (no leading `./`; the app adds it).
- `alt` — human-readable description, typically `<Place> <Year>`.

## Image notes
- Any resolution/aspect ratio works — images display via `object-fit: cover`
  in a square grid, so they are cropped to a square automatically.
- No thumbnails are needed for Moments (unlike Movies): the grid uses the
  full image directly with `loading="lazy"`.

## Important
- ALWAYS confirm the file name (and year if ambiguous) with the user before
  moving/renaming the image.
- ALWAYS derive `<cc>` from the country the photo was taken in, using the
  ISO 3166-1 alpha-2 code.
- Update `README.md` images tree when a new year folder is created.
