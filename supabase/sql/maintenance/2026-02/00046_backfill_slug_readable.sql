-- ===========================================
-- Script: 00046_backfill_slug_readable.sql
-- Author: Pretty Kaur
-- Date: 2026-02-05
-- Purpose:
--   - Backfill clue.slug_readable for existing rows so slug_readable is never null
--   - If slug_readable is null, daily answers page will render non-clickable clue text
-- ===========================================

update public.clue
set slug_readable = lower(
  regexp_replace(
    regexp_replace(trim(text), '[^a-zA-Z0-9\s]+', '', 'g'),
    '\s+', '-', 'g'
  )
)
where slug_readable is null;