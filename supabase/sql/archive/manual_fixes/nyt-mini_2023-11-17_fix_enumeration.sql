-- ===========================================
-- Script: nyt-mini_2023-11-17_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-24
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-11-17
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 4-Across: BIGSUR → BIG SUR (3,3)
update clue_occurrence
set
  enumeration = '3,3',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-11-17'
)
and number = 4
and direction = 'across';