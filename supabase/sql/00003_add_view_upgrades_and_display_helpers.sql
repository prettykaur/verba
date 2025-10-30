-- ===========================================
-- Script: 00003_add_view_upgrades_and_display_helpers.sql
-- Author: Pretty Kaur
-- Date: 2025-10-15
-- Purpose: Add display and search helper functions.
--           - Creates helper SQL functions such as format_answer()
--           - Adds initial v_search_results and v_search_results_pretty views
--           - Improves frontend readability (enumeration, formatted answers)
-- ===========================================

-- 1) Optional display helpers on occurrences (safe if already added)
alter table clue_occurrence
  add column if not exists enumeration text,     -- e.g. '3,4' or '5-2-3'
  add column if not exists answer_display text;  -- manual pretty override

-- 2) Helper to format a normalized answer using enumeration
create or replace function format_answer(ans text, enum text, joiner text default ' ')
returns text
language plpgsql
as $$
declare
  nums int[];
  out  text := '';
  pos  int  := 1;
  n    int;
  i    int  := 1;
begin
  if ans is null then return null; end if;
  if enum is null or enum = '' then return ans; end if;

  select array_agg((regexp_matches(enum, '\d+', 'g'))[1]::int) into nums;
  if nums is null then
    return ans;
  end if;

  foreach n in array nums loop
    if i > 1 then out := out || joiner; end if;
    out := out || substr(ans, pos, n);
    pos := pos + n;
    i := i + 1;
  end loop;

  return out;
end $$;

-- 3) Recreate v_search_results WITHOUT renaming existing columns.
--    We keep the old columns intact and APPEND the new ones.
create or replace view v_search_results as
select
  c.id                as clue_id,        -- (unchanged) keep first column name
  c.text              as clue_text,
  co.answer,
  co.answer_len,
  co.word_id,
  w.text              as word_text,
  w.len               as word_len,
  pd.puzzle_date,
  ps.slug             as source_slug,
  ps.name             as source_name,
  -- NEW appended columns:
  co.id               as occurrence_id,
  co.enumeration,
  co.answer_display
from clue_occurrence co
join clue c           on c.id  = co.clue_id
join puzzle_day pd    on pd.id = co.puzzle_day_id
join puzzle_source ps on ps.id = pd.source_id
left join word w      on w.id  = co.word_id;

-- 4) Pretty wrapper view prefers: answer_display > formatted(enumeration) > raw answer
create or replace view v_search_results_pretty as
select
  vsr.*,
  coalesce(
    vsr.answer_display,
    format_answer(vsr.answer, vsr.enumeration, ' ')
  ) as answer_pretty
from v_search_results vsr;
