# Verba URL & Slug Registry

This document defines the **canonical URL structure and slug registry** for Verba.
Once a slug is public, it MUST NOT be changed.

---

## Primary Namespaces

- `/answers/{source-slug}/{yyyy-mm-dd}` — daily puzzle answers (canonical)
- `/answers/{source-slug}/today` — convenience redirect (non-canonical)
- `/clue/{clue-slug}` — clue-first long-tail pages (canonical)

---

## Source Slug Registry

Each slug uniquely identifies a puzzle **source + puzzle type**.

### New York Times

- `nyt-crossword` — The New York Times Crossword
- `nyt-mini` — The New York Times Mini Crossword
- `nyt-bonus` — The New York Times Bonus Crossword

### Los Angeles Times

- `latimes-crossword` — LA Times Crossword
- `latimes-mini` — LA Times Mini Crossword

### The New Yorker

- `newyorker-crossword` — The New Yorker Crossword
- `newyorker-mini` — The New Yorker Mini Crossword

### Washington Post

- `washpost-mini-meta` — Washington Post Mini Meta Crossword
- `washpost-easy` — Washington Post Easy Crossword
- `washpost-medium` — Washington Post Medium Crossword
- `washpost-stans` — Washington Post Stan’s Crossword
- `washpost-sunday` — Washington Post Sunday Crossword

### Wall Street Journal

- `wsj-crossword` — Wall Street Journal Crossword

### The Atlantic

- `atlantic-crossword` — The Atlantic Crossword

### USA Today

- `usatoday-crossword` — USA Today Crossword

### The Guardian

- `guardian-quick` — Guardian Quick Crossword
- `guardian-cryptic` — Guardian Cryptic Crossword
- `guardian-quiptic` — Guardian Quiptic Crossword
- `guardian-sunday` — Guardian Sunday Crossword

---

## Slug Rules (Non-Negotiable)

- Slugs are lowercase
- Words separated by hyphens
- No spaces, underscores, or punctuation
- Slugs represent **source + puzzle type**, not date
- Once indexed, slugs MUST NOT be renamed

---

## Canonical Rules

- Canonical daily pages: `/answers/{source-slug}/{yyyy-mm-dd}`
- `/today` URLs must redirect to dated pages and are never indexed
- Query parameters (`?len=`, `?source=`, `?pattern=`) are filters only and must not define canonical identity

---

## Notes

If a source ever publishes multiple puzzles of the same type on the same day,
a source-specific extension may be added **without changing existing URLs**.
