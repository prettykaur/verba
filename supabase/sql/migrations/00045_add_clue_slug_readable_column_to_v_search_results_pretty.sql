-- ===========================================
-- Script: 00045_add_clue_slug_readable_column_to_v_search_results_pretty.sql
-- Author: Pretty Kaur
-- Date: 2026-02-05
-- Purpose:
--   - Add clue_slug_readable column to v_search_results_pretty table
--   - Allows us to derive correct slugs for quick clue and clue pages and generate slug URLs
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
  coalesce(
    vsr.answer_display,
    format_answer(vsr.answer, vsr.enumeration, ' '::text)
  ) as answer_pretty,
  c.slug_readable as clue_slug_readable
from public.v_search_results vsr
join public.clue c on c.id = vsr.clue_id;