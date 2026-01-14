-- ===========================================
-- Script: 00023_sanity_check_nyt-mini_ingestion.sql
-- Author: Pretty Kaur
-- Date: 2026-01-14
-- Purpose:
--   - Audit NYT Mini data ingestion
-- ===========================================

select
  ps.slug        as source_slug,
  pd.puzzle_date,
  co.number,
  co.direction,
  c.text as clue,
  co.answer,
  co.answer_len,
  co.enumeration,
  co.answer_display,
  co.enumeration_source
from clue_occurrence co
join clue c on c.id = co.clue_id
join puzzle_day pd on pd.id = co.puzzle_day_id
join puzzle_source ps on ps.id = pd.source_id
where
  ps.slug = 'nyt-mini'
  and pd.puzzle_date = date '2026-01-13'
order by
  co.direction,
  co.number;