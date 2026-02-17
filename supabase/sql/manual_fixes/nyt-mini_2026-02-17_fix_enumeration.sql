-- ===========================================
-- Script: nyt-mini_2026-02-17_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-02-17
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2026-02-17
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 1-Down: OHYOU → OH YOU (2,3)
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
    and pd.puzzle_date = date '2026-02-17'
)
and number = 1
and direction = 'down';