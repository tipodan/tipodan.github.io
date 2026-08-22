# Adding Movies to tipodan.github.io

## Project location
/mnt/c/Users/eteodan/workspace/GITHUB/tipodan.github.io-main

## Workflow for adding movies

1. Translate movie title to English (keep original if Spanish film)
2. Find the movie on TMDB: search at `https://www.themoviedb.org/search?query=<title>`
3. Verify the correct movie by checking `<title>` tag on the movie page
4. **MANDATORY: Present findings to user for confirmation before downloading.** Show:
   - TMDB ID and title (in Spanish as shown on TMDB)
   - Year
   - Director
   - Main cast (2-3 actors)
   - Link to the posters page
   - Do NOT proceed until the user explicitly confirms
5. Get English poster (or Spanish for Spanish films):
   - English: `https://www.themoviedb.org/movie/<id>/images/posters?language=es&image_language=en`
   - Spanish: `https://www.themoviedb.org/movie/<id>/images/posters?language=es`
6. Extract poster paths from page: `grep -oP '(image\.tmdb\.org/t/p/original/[^"]+\.jpg|\d{3,4}x\d{3,4})'`
7. Select first poster with width >= 1000px
8. Download from `https://image.tmdb.org/t/p/original/<path>.jpg`
9. Save as `assets/images/movies/<year>/<slug>.jpg`
10. Verify download: check file is JPEG and dimensions >= 1000px wide
11. Add entry to `data/movies.json`: `{ "year": <year>, "name": "<English name>", "slug": "<slug>" }`

## Slug rules
- Lowercase, ASCII only (strip accents)
- Spaces/special chars → hyphens
- Strip trailing hyphens

## Important
- ALWAYS verify the TMDB movie ID is correct before downloading (check `<title>` tag)
- ALWAYS confirm with user before downloading — present movie details (title, year, director, cast, poster link)
- When there are multiple versions (remakes, reboots), ask which one
- Spanish films keep their original name and Spanish poster
- The SPA auto-detects new years from movies.json — no other code changes needed
- Update README.md tree if a new year folder is created
