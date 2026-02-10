-- ===========================================
-- Script: 00047_create_common_answers_views.sql
-- Author: Pretty Kaur
-- Date: 2026-02-10
-- Purpose:
-- - v_occurrence_answer_key: occurrences with a normalized answer_key
-- - v_answer_stats: aggregated frequency + last_seen per answer_key
-- ===========================================

create or replace view public.v_occurrence_answer_key as
select
  -- keep names aligned with app usage
  occurrence_id,
  clue_text,
  clue_slug_readable as clue_slug,
  answer,
  answer_pretty,
  answer_len,
  number,
  direction,
  source_slug,
  source_name,
  puzzle_date,

  -- normalized key: uppercase letters only
  regexp_replace(
    upper(coalesce(answer_pretty, answer, '')),
    '[^A-Z]',
    '',
    'g'
  ) as answer_key

from public.v_search_results_pretty
where coalesce(answer_pretty, answer) is not null;

create or replace view public.v_answer_stats as
select
  answer_key,
  length(answer_key) as answer_len,
  count(*)::int as occurrence_count,
  max(puzzle_date)::date as last_seen
from public.v_occurrence_answer_key
where answer_key <> ''
group by answer_key;