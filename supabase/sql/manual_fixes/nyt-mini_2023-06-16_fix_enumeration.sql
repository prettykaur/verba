-- ===========================================
-- Script: nyt-mini_2023-06-16_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-27
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-06-16
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 9-Across: TRYON → TRY ON (3,2)
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
    and pd.puzzle_date = date '2023-06-16'
)
and number = 9
and direction = 'across';