-- ===========================================
-- Script: nyt-mini_2024-07-06_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-19
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-07-06
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 1-Across: INA → IN A (2,1)
update clue_occurrence
set
  enumeration = '2,1',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-07-06'
)
and number = 1
and direction = 'across';

-- 1-Down: ALLCAPS → ALL CAPS (3,4)
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
    and pd.puzzle_date = date '2024-07-06'
)
and number = 1
and direction = 'down';

-- 3-Down: INAWORD → IN A WORD (2,1,4)
update clue_occurrence
set
  enumeration = '2,1,4',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-07-06'
)
and number = 3
and direction = 'down';

-- 5-Down: INONE → IN ONE (2,3)
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
    and pd.puzzle_date = date '2024-07-06'
)
and number = 5
and direction = 'down';