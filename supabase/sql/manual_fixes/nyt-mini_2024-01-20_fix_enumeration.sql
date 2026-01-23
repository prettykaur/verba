-- ===========================================
-- Script: nyt-mini_2024-01-20_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-23
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-01-20
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 6-Across: THINICE → THIN ICE (4,3)
update clue_occurrence
set
  enumeration = '4,3',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-01-20'
)
and number = 6
and direction = 'across';

-- 3-Down: INDEPTH → IN DEPTH (2,5)
update clue_occurrence
set
  enumeration = '2,5',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-01-20'
)
and number = 3
and direction = 'down';