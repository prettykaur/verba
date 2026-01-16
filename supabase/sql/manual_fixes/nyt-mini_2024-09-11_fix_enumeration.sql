-- ===========================================
-- Script: nyt-mini_2024-09-11_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-16
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-09-11
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 5-Across: SODOI → SO DO I (2,2,1)
update clue_occurrence
set
  enumeration = '2,2,1',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-09-11'
)
and number = 5
and direction = 'across';