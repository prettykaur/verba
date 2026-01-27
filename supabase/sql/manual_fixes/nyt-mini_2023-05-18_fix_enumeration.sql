-- ===========================================
-- Script: nyt-mini_2023-05-18_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-28
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-05-18
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 4-Down: ISAY → I SAY (1,3)
update clue_occurrence
set
  enumeration = '1,3',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-05-18'
)
and number = 4
and direction = 'down';