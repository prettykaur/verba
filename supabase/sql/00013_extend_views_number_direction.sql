-- Drop the dependent views first to avoid name/column conflicts
drop view if exists v_search_results_pretty cascade;
drop view if exists v_search_results cascade;

-- Recreate base view with number/direction added
create or replace view v_search_results as
select
  co.id              as occurrence_id,
  c.id               as clue_id,
  c.text             as clue_text,
  co.answer,
  co.answer_len,
  co.word_id,
  w.text             as word_text,
  w.len              as word_len,
  pd.puzzle_date,
  ps.slug             as source_slug,
  ps.name             as source_name,
  co.enumeration,
  co.answer_display,
  co.number,
  co.direction
from clue_occurrence co
join clue c           on c.id  = co.clue_id
join puzzle_day pd    on pd.id = co.puzzle_day_id
join puzzle_source ps on ps.id = pd.source_id
left join word w      on w.id  = co.word_id;

-- Recreate pretty view that wraps the base one
create or replace view v_search_results_pretty as
select
  vsr.*,
  coalesce(vsr.answer_display, format_answer(vsr.answer, vsr.enumeration, ' ')) as answer_pretty
from v_search_results vsr;
