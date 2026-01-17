-- ===========================================
-- Script: nyt-mini_2024-08-21_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-17
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-08-21
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 6-Across: ANODE → A NODE (1,4))
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
    and pd.puzzle_date = date '2024-08-21'
)
and number = 6
and direction = 'across';