-- ===========================================
-- Script: 00037_sanity_check_manual_has_display.sql
-- Author: Pretty Kaur
-- Date: 2026-01-14
-- Purpose:
--   - Sanity check: manual enumerations should have non-null answer_display
--   - Should return 0 rows once you regenerate.
-- ===========================================

select
  pd.puzzle_date,
  ps.slug as source_slug,
  co.number,
  co.direction,
  co.answer,
  co.enumeration,
  co.answer_display
from clue_occurrence co
join puzzle_day pd on pd.id = co.puzzle_day_id
join puzzle_source ps on ps.id = pd.source_id
where co.enumeration_source = 'manual'
  and (co.answer_display is null or co.answer_display = '');
