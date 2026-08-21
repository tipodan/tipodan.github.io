# 🎬 tipodan.github.io

Personal film diary and review site. Static pages with yearly logs of watched movies.

## Live

[https://tipodan.github.io](https://tipodan.github.io)

## Structure

```
tipodan.github.io/
├── index.html                  ← Home page
├── 2024.html                   ← 2024 movie list
├── 2025.html                   ← 2025 movie list
├── other.html                  ← Miscellaneous page
├── 2024/                       ← Individual film pages (2024)
│   ├── dune-part-two.html
│   ├── resources/              ← Film posters/images
│   └── ...
├── 2025/                       ← Individual film pages (2025)
│   ├── anora.html
│   ├── resources/
│   └── ...
├── files/                      ← Shared CSS, JS and assets
│   ├── tipodan.min.css
│   ├── script.js
│   └── ...
└── generator_resources/        ← Page generator (GUI)
    ├── generator.py            ← Main generator with tkinter GUI
    ├── 2024_movies.json        ← Movie registry for 2024
    ├── 2025_movies.json        ← Movie registry for 2025
    ├── 2025_template.html      ← Year listing template
    └── 2025_film_template.html ← Individual film page template
```

## Adding a new movie

Run the GUI generator:

```bash
cd generator_resources
python3 generator.py
```

A window will open where you can:

1. Select the year (defaults to the latest)
2. Type the movie name → a slug is generated automatically (editable)
3. Click "Seleccionar..." to pick the poster image from your PC
4. Click "Añadir"

The generator will:
- Rename and copy the poster to `<year>/resources/<slug>.jpg`
- Add the movie to the `<year>_movies.json` registry
- Regenerate the year listing page and all individual film pages

### Rebuilding pages manually

If you edit a template, regenerate all pages for a year:

```bash
cd generator_resources
python3 -c "from generator import rebuild; rebuild('2025')"
```

## Adding a new year

1. Create `<year>/` and `<year>/resources/` directories
2. Create `generator_resources/<year>_template.html` and `<year>_film_template.html` (copy from an existing year and update)
3. The generator will auto-detect the new year in the dropdown
4. Update the navigation in `index.html` and `other.html` to include the new year link

## Tech stack

- HTML + CSS + vanilla JavaScript
- jQuery + FlexSlider for image galleries
- Python script for page generation from templates
- Hosted on GitHub Pages
