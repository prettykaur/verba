-- ===========================================
-- Script: nyt-mini_2024-06-01_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-19
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-06-01
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 1-Across: DEADON → DEAD ON (4,2)
update clue_occurrence
set
  enumeration = '4,2',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-06-01'
)
and number = 1
and direction = 'across';

-- 12-Across: ONTIME → ON TIME (2,4)
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
    and pd.puzzle_date = date '2024-06-01'
)
and number = 12
and direction = 'across';

-- 4-Down: DEEPDIVE → DEEP DIVE (4,4)
update clue_occurrence
set
  enumeration = '4,4',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-06-01'
)
and number = 4
and direction = 'down';