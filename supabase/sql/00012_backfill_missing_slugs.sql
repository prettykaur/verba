-- ===========================================
-- Script: 00012_backfill_missing_slugs.sql
-- Author: Pretty Kaur
-- Date: 2025-10-30
-- Purpose: Backfill any missing slug_readable or slug_md5 values.
--           - Ensures all clues have both SEO-friendly and unique hashed slugs
--           - Final cleanup step before production or staging deployment
-- ===========================================

-- Backfill hybrid slugs for any legacy/test clues
update clue
set slug_readable = coalesce(nullif(slug_readable, ''), slugify(text)),
    slug_md5      = coalesce(nullif(slug_md5, ''), md5(text))
where slug_readable is null
   or slug_readable = ''
   or slug_md5 is null
   or slug_md5 = '';
