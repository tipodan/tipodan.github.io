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
└── generator_resources/        ← Python page generator
    ├── 2025_generator.py
    ├── 2025_template.html
    └── 2025_film_template.html
```

## Adding a new movie

1. Edit `generator_resources/2025_generator.py` and add the movie to the `movies` list
2. Place the poster image in `2025/resources/<slug>.jpg`
3. Run the generator:

```bash
cd generator_resources
python3 2025_generator.py
```

This regenerates `2025.html` and all individual film pages from templates.

## Adding a new year

1. Duplicate and adapt the generator, templates, and resource folder for the new year
2. Create the `<year>/` and `<year>/resources/` directories
3. Update the navigation in `index.html` and `other.html` to include the new year link

## Tech stack

- HTML + CSS + vanilla JavaScript
- jQuery + FlexSlider for image galleries
- Python script for page generation from templates
- Hosted on GitHub Pages
