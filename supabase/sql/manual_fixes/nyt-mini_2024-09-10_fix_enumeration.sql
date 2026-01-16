-- ===========================================
-- Script: nyt-mini_2024-09-10_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-16
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-09-10
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 2-Down: IMOUT → I'M OUT (2,3)
update clue_occurrence
set
  enumeration = '2,3',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-09-10'
)
and number = 2
and direction = 'down';

-- 3-Down: NOTSO → NOT SO (3,2)
update clue_occurrence
set
  enumeration = '3,2',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-09-10'
)
and number = 3
and direction = 'down';