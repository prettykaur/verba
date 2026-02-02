-- ===========================================
-- Script: 00043_backfill_clue_slug_readable.sql
-- Author: Pretty Kaur
-- Date: 2026-01-29
-- Purpose:
--   - Populate slug_readable for existing clues
--   - Generate SEO-friendly, human-readable slugs from clue text
--   - Ensure canonical /clue/[slug] URLs can be resolved
--   - Support 301 redirects from numeric occurrence IDs
-- ===========================================

update clue
set slug_readable =
  lower(
    regexp_replace(
      trim(text),
      '[^a-zA-Z0-9]+',
      '-',
      'g'
    )
  )
where slug_readable is null;
