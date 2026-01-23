-- ===========================================
-- Script: nyt-mini_2024-02-17_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-23
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-02-17
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 1-Across: BIGBIRD → BIG BIRD (3,4)
update clue_occurrence
set
  enumeration = '3,4',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-02-17'
)
and number = 1
and direction = 'across';

-- 5-Down: INHEELS → IN HEELS (2,5)
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
    and pd.puzzle_date = date '2024-02-17'
)
and number = 5
and direction = 'down';