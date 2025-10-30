-- ===========================================
-- Script: 00006_create_staging_seed.sql
-- Author: Pretty Kaur
-- Date: 2025-10-28
-- Purpose: Create staging table for safe CSV imports.
--           - Defines staging_occurrence_seed table
--           - Used for bulk seeding and normalization before production insert
--           - Includes helpful index on clue_text for faster joins
-- ===========================================

-- ===========================================
-- 00006_create_staging_seed.sql
-- Staging table for bulk CSV imports (seed data)
-- ===========================================

-- Uses the enum `dir` you already created ('across' | 'down').
-- Staging is INTERNAL: we do NOT enable RLS here.

create table if not exists staging_occurrence_seed (
  -- where you sourced it from (free text). Default to 'seed'
  source_slug   text default 'seed',

  -- if you don't know the date, leave NULL or default
  puzzle_date   date default '2025-01-01',

  -- leave both number & direction NULL for now if unknown
  number        int,
  direction     dir,               -- enum across/down; nullable

  -- required
  clue_text     text not null,
  answer        text not null,     -- put uppercase in CSV if possible

  -- optional display helpers (safe to leave blank)
  enumeration   text,              -- e.g. '3,4' or '5-2-3'
  source_url    text,

  -- optional hybrid slugs (you can leave blank; we backfill)
  slug_readable text,
  slug_md5      text,

  -- housekeeping
  inserted_at   timestamptz default now()
);

-- Helpful index for faster validation/joins during promotion
create index if not exists idx_staging_clue_text on staging_occurrence_seed (clue_text);
