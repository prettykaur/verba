-- ===========================================
-- Script: 00053_use_raw_answer_in_v_search_results_pretty.sql
-- Author: Pretty Kaur
-- Date: 2026-03-04
-- Purpose:
-- - Stop using enumeration-based formatting for display
-- - Set answer_pretty to the raw stored answer (vsr.answer)
-- - Keep enumeration/answer_display columns for compatibility, but ignore them for rendering
-- ===========================================

create or replace view public.v_search_results_pretty as
select
  vsr.occurrence_id,
  vsr.clue_id,
  vsr.clue_text,
  vsr.answer,
  vsr.answer_len,
  vsr.word_id,
  vsr.word_text,
  vsr.word_len,
  vsr.puzzle_date,
  vsr.source_slug,
  vsr.source_name,
  vsr.enumeration,
  vsr.answer_display,
  vsr.number,
  vsr.direction,
  vsr.answer as answer_pretty,
  c.slug_readable as clue_slug_readable
from
  v_search_results vsr
  join clue c on c.id = vsr.clue_id;