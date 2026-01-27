-- ===========================================
-- Script: nyt-mini_2023-06-03_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-27
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-06-03
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 7-Across: REDEYES → RED EYES (3,4)
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
    and pd.puzzle_date = date '2023-06-03'
)
and number = 7
and direction = 'across';

-- 2-Down: ORDERUP → ORDER UP (5,2)
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
    and pd.puzzle_date = date '2023-06-03'
)
and number = 2
and direction = 'down';

-- 5-Down: SHEHER → SHE HER (3,3)
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
    and pd.puzzle_date = date '2023-06-03'
)
and number = 5
and direction = 'down';