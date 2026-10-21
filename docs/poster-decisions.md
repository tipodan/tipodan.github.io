# Poster Decisions Log

Structured record of poster choices made when adding movies. Used to make future poster recommendations more precise. Append a new entry after every confirmed choice (newest at the bottom). See `.kiro/steering/tmdb-movies.md` → "Learned poster preferences" for the distilled rules derived from this log.

## Attributes captured per decision
- **date** — date the decision was made (YYYY-MM-DD)
- **movie** — name as stored in `movies.json`
- **tmdb_id** — TMDB movie ID
- **diary_year** — `year` value in `movies.json` (year watched)
- **poster_language** — `es` or `en`
- **has_credits** — poster includes billing block / technical credits (yes/no)
- **has_laurels** — poster shows festival laurels/awards (yes/no)
- **has_press_quote** — poster shows a press/critic quote (yes/no)
- **art_type** — `character-photo` | `collage` | `minimalist` | `teaser` | `other`
- **dimensions** — original poster dimensions (WxH)
- **options_shown** — how many candidate posters were presented
- **chosen_index** — which option the user picked (1-based, order as presented)
- **matched_recommendation** — did the pick match my recommendation? (yes/no)
- **notes** — optional reason or context

## Decisions

### 2026-10-21 — Valor sentimental
- tmdb_id: 1124566
- diary_year: 2026
- poster_language: es
- has_credits: yes
- has_laurels: yes (Cannes 2025, San Sebastián)
- has_press_quote: yes ("La mejor película del año" — Vogue)
- art_type: character-photo
- dimensions: 2000x3000
- options_shown: 3 (2 were ≥1000px variants + 1 discarded at 669px)
- chosen_index: 1
- matched_recommendation: yes
- notes: Picked the full official theatrical poster (top-billed cast, press quote, festival laurels, full billing block) over the artistic collage and the clean title-only variant.
