-- ===========================================
-- Script: nyt-mini_2026-02-20_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-02-20
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2026-02-20
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 3-Down: ITSOK → ITS OK (3,2)
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
    and pd.puzzle_date = date '2026-02-20'
)
and number = 3
and direction = 'down';