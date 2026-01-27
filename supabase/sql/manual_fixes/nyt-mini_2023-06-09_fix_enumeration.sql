-- ===========================================
-- Script: nyt-mini_2023-06-09_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-27
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-06-09
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 1-Across: ADLIB → AD LIB (2,3)
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
    and pd.puzzle_date = date '2023-06-09'
)
and number = 1
and direction = 'across';

-- 3-Down: LIKEA → LIKE A (4,1)
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
    and pd.puzzle_date = date '2023-06-09'
)
and number = 3
and direction = 'down';