-- ===========================================
-- Script: nyt-mini_2024-08-03_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-17
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-08-03
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 2-Down: ONATEAM → ON A TEAM (2,1,4)
update clue_occurrence
set
  enumeration = '2,1,4',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-08-03'
)
and number = 2
and direction = 'down';