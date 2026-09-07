# Project Documentation Rules

## README.md must stay in sync

Whenever any of the following changes occur, update `README.md` accordingly:

- Files or directories are added or removed
- Folder structure changes (new year folders, new sections, etc.)
- Routes are added, renamed, or removed
- Tech stack changes (new libraries, tools, or workflows)
- Key design decisions change
- Instructions for adding content change (e.g., new steps, removed tools)

## What to update

- **Architecture tree** — must reflect the actual folder structure
- **Routes table** — must list all current SPA routes
- **"How it works" section** — if app behavior changes
- **"Adding a new..." sections** — if the workflow changes
- **Tech stack** — if dependencies or tools change

## When in doubt

If a change touches anything outside `data/` (i.e., not just adding a movie or flight entry), the README likely needs an update. Check before finishing.

## Writing style

- **Do NOT hard-wrap lines when writing `README.md`.** Keep each paragraph, list item, or sentence on a single line — do not insert manual line breaks to wrap text at a fixed column width. Let the editor/renderer soft-wrap.
- This applies to all prose, list items, and table rows in `README.md`.
- Only use line breaks to separate distinct paragraphs, list items, headings, or code blocks — never mid-sentence.
- The same rule applies to these steering files: keep each item on a single line, no mid-sentence wrapping.
