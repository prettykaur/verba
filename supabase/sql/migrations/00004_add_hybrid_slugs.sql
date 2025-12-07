-- ===========================================
-- Script: 00004_add_hybrid_slugs.sql
-- Author: Pretty Kaur
-- Date: 2025-10-15
-- Purpose: Introduce hybrid slug support for clues.
--           - Adds slug_md5 (unique internal key) and slug_readable (SEO key)
--           - Updates clue-related views to include both slug types
--           - Enables future canonical clue pages for SEO and linking
-- ===========================================

-- === 1) Helpers ===
-- Simple slugify helper (lowercase, spaces -> dashes, strip non-alphanum/-)
create or replace function slugify(s text)
returns text
language sql immutable as $$
  select regexp_replace(
           regexp_replace(lower(coalesce(s,'')), '\s+', '-', 'g'),
           '[^a-z0-9\-]', '', 'g'
         )
$$;

-- === 2) Add columns to clue ===
alter table clue
  add column if not exists slug_md5 text,
  add column if not exists slug_readable text;

-- Backfill from clue.text
update clue
set slug_md5 = md5(text)
where slug_md5 is null;

update clue
set slug_readable = slugify(text)
where slug_readable is null;

-- Unique & indexes
do $$ begin
  alter table clue add constraint clue_slug_md5_uniq unique (slug_md5);
exception when duplicate_object then null; end $$;

create index if not exists clue_slug_readable_idx on clue (slug_readable);

-- Optional: keep old 'slug' column in sync (legacy)
-- If you want, mirror readable into old slug for now:
update clue
set slug = coalesce(slug, slug_readable);

-- === 3) Update views to expose new slugs ===
create or replace view v_search_results as
select
  co.id                as occurrence_id,
  c.id                 as clue_id,
  c.text               as clue_text,
  c.slug_md5,
  c.slug_readable,
  co.answer,
  co.answer_len,
  co.word_id,
  w.text               as word_text,
  w.len                as word_len,
  pd.puzzle_date,
  ps.slug              as source_slug,
  ps.name              as source_name,
  co.enumeration,
  co.answer_display
from clue_occurrence co
join clue c           on c.id  = co.clue_id
join puzzle_day pd    on pd.id = co.puzzle_day_id
join puzzle_source ps on ps.id = pd.source_id
left join word w      on w.id  = co.word_id;

create or replace view v_search_results_pretty as
select
  vsr.*,
  coalesce(
    vsr.answer_display,
    format_answer(vsr.answer, vsr.enumeration, ' ')
  ) as answer_pretty
from v_search_results vsr;
