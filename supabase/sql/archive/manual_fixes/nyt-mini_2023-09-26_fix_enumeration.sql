-- ===========================================
-- Script: nyt-mini_2023-09-26_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-26
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-09-26
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 1-Down: AWISH → A WISH (1,4)
update clue_occurrence
set
  enumeration = '1,4',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-09-26'
)
and number = 1
and direction = 'down';