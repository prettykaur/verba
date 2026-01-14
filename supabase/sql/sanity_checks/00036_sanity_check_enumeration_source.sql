-- ===========================================
-- Script: 00036_sanity_check_enumeration_source.sql
-- Author: Pretty Kaur
-- Date: 2026-01-14
-- Purpose:
--   - Sanity check: enumeration matches answer length (letters only)
--   - Catches impossible enumerations like 2,2 for a 5-letter answer
--   - Should return 0 rows
-- ===========================================

with enum_expanded as (
  select
    co.id,
    co.answer,
    co.enumeration,
    co.enumeration_source,
    sum(e.part::int) as enum_sum
  from clue_occurrence co
  cross join lateral regexp_split_to_table(co.enumeration, ',') as e(part)
  where co.enumeration is not null
    and co.enumeration <> ''
    and co.enumeration ~ '^[0-9]+(,[0-9]+)*$'
  group by
    co.id,
    co.answer,
    co.enumeration,
    co.enumeration_source
)
select *
from enum_expanded
where enum_sum <> length(answer);
