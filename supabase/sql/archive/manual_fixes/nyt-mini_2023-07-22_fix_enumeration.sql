-- ===========================================
-- Script: nyt-mini_2023-07-22_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-27
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-07-22
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 10-Across: SLIDEIN → SLIDE IN (5,2)
update clue_occurrence
set
  enumeration = '5,2',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-07-22'
)
and number = 10
and direction = 'across';

-- 12-Across: SOLATE → SO LATE (2,4)
update clue_occurrence
set
  enumeration = '2,4',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-07-22'
)
and number = 12
and direction = 'across';

-- 6-Down: GETLOW → GET LOW (3,3)
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
    and pd.puzzle_date = date '2023-07-22'
)
and number = 6
and direction = 'down';