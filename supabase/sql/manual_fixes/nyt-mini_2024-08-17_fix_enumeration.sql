-- ===========================================
-- Script: nyt-mini_2024-08-17_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-17
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-08-17
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 12-Across: ANTHILL → ANT HILL (3,4)
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
    and pd.puzzle_date = date '2024-08-17'
)
and number = 12
and direction = 'across';

-- 1-Down: CABLETV → CABLE TV (5,2)
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
    and pd.puzzle_date = date '2024-08-17'
)
and number = 1
and direction = 'down';

-- 3-Down: DEADAIR → DEAD AIR (4,3)
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
    and pd.puzzle_date = date '2024-08-17'
)
and number = 3
and direction = 'down';