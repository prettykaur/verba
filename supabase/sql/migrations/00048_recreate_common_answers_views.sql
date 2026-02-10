-- ===========================================
-- Script: 00048_recreate_common_answers_views.sql
-- Author: Pretty Kaur
-- Date: 2026-02-10
-- Purpose:
-- - Add last_seen_source_slug in order to compute last_seen URL on /answers/common
-- ===========================================

create or replace view public.v_answer_stats as
with ranked as (
  select
    answer_key,
    length(answer_key) as answer_len,
    puzzle_date,
    source_slug,
    row_number() over (
      partition by answer_key
      order by puzzle_date desc
    ) as rn
  from public.v_occurrence_answer_key
  where answer_key <> ''
)
select
  r.answer_key,
  r.answer_len,
  count(*)::int as occurrence_count,
  max(r.puzzle_date)::date as last_seen,
  max(r.source_slug) filter (where r.rn = 1) as last_seen_source_slug
from ranked r
group by r.answer_key, r.answer_len;