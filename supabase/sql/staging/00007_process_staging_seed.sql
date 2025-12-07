-- ===========================================
-- UPDATED 00007_process_staging_seed.sql
-- Author: Pretty Kaur
-- Date: 2025-12-07
-- Generic promotion from staging_occurrence_seed
-- Handles arbitrary source_slug (e.g. 'nyt-mini')
-- ===========================================

-- 0) Ensure base puzzle_type exists
insert into puzzle_type (slug, name, has_grid, has_clues)
values ('crossword','Crossword', true, true)
on conflict (slug) do nothing;

-- 1) Ensure puzzle_source rows exist for any source_slug in staging
--    (for slugs that already exist, nothing happens)
insert into puzzle_source (slug, name, puzzle_type_id)
select
  s.source_slug,
  initcap(replace(coalesce(nullif(s.source_slug,''), 'seed'), '-', ' ')) as name,
  pt.id as puzzle_type_id
from (
  select distinct coalesce(nullif(source_slug,''), 'seed') as source_slug
  from staging_occurrence_seed
) s
cross join puzzle_type pt
where pt.slug = 'crossword'
on conflict (slug) do nothing;

-- 2) Ensure puzzle_day exists for each (source_slug, puzzle_date)
insert into puzzle_day (source_id, puzzle_type_id, puzzle_date)
select
  ps.id,
  ps.puzzle_type_id,
  coalesce(s.puzzle_date, date '2025-01-01') as puzzle_date
from staging_occurrence_seed s
join puzzle_source ps
  on ps.slug = coalesce(nullif(s.source_slug,''), 'seed')
group by
  ps.id,
  ps.puzzle_type_id,
  coalesce(s.puzzle_date, date '2025-01-01')
on conflict (source_id, puzzle_date) do nothing;

-- 3) Upsert CLUES from staging (canonicalized by text)
insert into clue (text, slug)
select distinct s.clue_text, slugify(s.clue_text)
from staging_occurrence_seed s
on conflict (slug) do nothing;

-- Backfill hybrid slugs
update clue c
set slug_md5      = coalesce(c.slug_md5, md5(c.text)),
    slug_readable = coalesce(c.slug_readable, slugify(c.text))
where c.slug_md5 is null
   or c.slug_readable is null;

-- 4) Insert OCCURRENCES (one per staging row)
insert into clue_occurrence (
  puzzle_day_id,
  clue_id,
  number,
  direction,
  answer,
  enumeration,
  source_url
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

-- 5) Maintain WORD dictionary + link from occurrences
insert into word (text)
select distinct upper(answer)
from clue_occurrence
on conflict (text) do nothing;

update clue_occurrence co
set word_id = w.id
from word w
where co.word_id is null
  and w.text = upper(co.answer);

-- 6) Fill answer_display using enumeration if provided
update clue_occurrence
set answer_display = format_answer(answer, enumeration, ' ')
where enumeration is not null
  and enumeration <> ''
  and answer_display is null;
