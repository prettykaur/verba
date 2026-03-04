-- ===========================================
-- Script: nyt-mini_2024-03-31_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-20
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-03-31
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 5-Across: UPONA → UPON A (4,1)
update clue_occurrence
set
  enumeration = '4,1',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-03-31'
)
and number = 5
and direction = 'across';