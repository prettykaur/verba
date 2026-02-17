-- ===========================================
-- Script: 00051_remove_seed_data_from_v_answer_stats.sql
-- Author: Pretty Kaur
-- Date: 2026-02-17
-- Purpose:
-- - Update v_answer_stats view so it filters out seed at the ranked and counts level
-- - Removes seed data from "Last seen" logic on the frontend
-- ===========================================

create or replace view v_answer_stats as
with ranked as (
  select
    v.answer_key,
    v.answer_len::integer as answer_len,
    v.occurrence_id,
    v.source_slug,
    v.puzzle_date,
    row_number() over (
      partition by v.answer_key
      order by v.puzzle_date desc, v.occurrence_id desc
    ) as rn
  from v_occurrence_answer_key v
  where v.source_slug <> 'seed'
),
counts as (
  select
    v.answer_key,
    count(*)::integer as occurrence_count
  from v_occurrence_answer_key v
  where v.source_slug <> 'seed'
  group by v.answer_key
)
select
  r.answer_key,
  r.answer_len,
  c.occurrence_count,
  r.puzzle_date as last_seen,
  r.source_slug as last_seen_source_slug,
  r.occurrence_id as last_seen_occurrence_id
from ranked r
join counts c on c.answer_key = r.answer_key
where r.rn = 1;