-- ===========================================
-- Script: 00050_recreate_common_answers_views.sql
-- Author: Pretty Kaur
-- Date: 2026-02-13
-- Purpose:
-- - Recreate v_answer_stats view with last_seen_occurrence_id
-- - Change answer_len type from smallint to integer
-- ===========================================

create view v_answer_stats as
with ranked as (
  select
    answer_key,
    answer_len::integer as answer_len,
    occurrence_id,
    source_slug,
    puzzle_date,
    row_number() over (
      partition by answer_key
      order by puzzle_date desc, occurrence_id desc
    ) as rn
  from v_occurrence_answer_key
),

counts as (
  select
    answer_key,
    count(*)::integer as occurrence_count
  from v_occurrence_answer_key
  group by answer_key
)

select
  r.answer_key,
  r.answer_len,
  c.occurrence_count,
  r.puzzle_date as last_seen,
  r.source_slug as last_seen_source_slug,
  r.occurrence_id as last_seen_occurrence_id
from ranked r
join counts c
  on c.answer_key = r.answer_key
where r.rn = 1;