-- ===========================================
-- Script: 00015_check_nyt-mini_output.sql
-- Author: Pretty Kaur
-- Date: 2025-12-07
-- ===========================================

select
  ps.slug        as source_slug,
  pd.puzzle_date,
  co.number,
  co.direction,
  co.answer,
  co.enumeration,
  co.answer_display
from clue_occurrence co
join puzzle_day pd
  on co.puzzle_day_id = pd.id
join puzzle_source ps
  on pd.source_id = ps.id
where ps.slug = 'nyt-mini'
  and pd.puzzle_date = date '2025-12-06'
order by co.direction, co.number;
