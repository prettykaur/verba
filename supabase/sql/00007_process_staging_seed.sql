-- ===========================================
-- Script: 00007_process_staging_seed.sql
-- Author: Pretty Kaur
-- Date: 2025-10-28
-- Purpose: Promote staging seed rows into production tables.
--           - Ensures 'seed' source and puzzle_day entries exist
--           - Upserts canonical clues, answers, and words
--           - Populates clue_occurrence table and links to dictionary
-- ===========================================

-- ===========================================
-- 00007_process_staging_seed.sql
-- Normalize staging rows into live tables
-- ===========================================

-- 1) Ensure the 'seed' crossword source/day exists
insert into puzzle_source (slug, name, puzzle_type_id)
select 'seed','Seed Import',
       (select id from puzzle_type where slug='crossword' limit 1)
on conflict (slug) do nothing;

-- Use each row's puzzle_date if provided; otherwise default to 2025-01-01
insert into puzzle_day (source_id, puzzle_type_id, puzzle_date)
select ps.id, ps.puzzle_type_id, d.pdate
from puzzle_source ps
cross join (
  select distinct coalesce(puzzle_date, date '2025-01-01') as pdate
  from staging_occurrence_seed
) d
where ps.slug = 'seed'
on conflict (source_id, puzzle_date) do nothing;

-- 2) Upsert CLUES from staging (canonicalized by text)
--    Also fill hybrid slugs if missing.
insert into clue (text, slug)
select distinct s.clue_text, slugify(s.clue_text)
from staging_occurrence_seed s
on conflict (slug) do nothing;

-- Backfill hybrid slugs
update clue c
set slug_md5      = coalesce(c.slug_md5, md5(c.text)),
    slug_readable = coalesce(c.slug_readable, slugify(c.text))
where c.slug_md5 is null or c.slug_readable is null;

-- 3) Insert OCCURRENCES (one per staging row)
--    For now, all seed rows map to puzzle_source 'seed' and their date (or default).
insert into clue_occurrence (
  puzzle_day_id, clue_id, number, direction, answer, enumeration, source_url
)
select
  pd.id,
  c.id,
  s.number,
  s.direction,
  upper(s.answer),
  nullif(s.enumeration,''),
  nullif(s.source_url,'')
from staging_occurrence_seed s
join puzzle_source ps
  on ps.slug = coalesce(nullif(s.source_slug,''), 'seed')
join puzzle_day pd
  on pd.source_id = ps.id
 and pd.puzzle_date = coalesce(s.puzzle_date, date '2025-01-01')
join clue c
  on c.text = s.clue_text
on conflict do nothing;

-- 4) Maintain WORD dictionary + link from occurrences
insert into word (text)
select distinct upper(answer)
from clue_occurrence
on conflict (text) do nothing;

update clue_occurrence co
set word_id = w.id
from word w
where co.word_id is null
  and w.text = upper(co.answer);

-- 5) Fill answer_display using enumeration if provided
update clue_occurrence
set answer_display = format_answer(answer, enumeration, ' ')
where enumeration is not null
  and enumeration <> ''
  and answer_display is null;

-- 6) Optional: quick de-dupe guard (rare; keep as info)
--    If multiple identical (clue_text, answer) pairs ended up on the same day,
--    you can clean here. For now we allow them (harmless for search).
