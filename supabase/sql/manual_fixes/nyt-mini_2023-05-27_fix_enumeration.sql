-- ===========================================
-- Script: nyt-mini_2023-05-27_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-28
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-05-27
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 1-Across: LOGOFF → LOG OFF (3,3)
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
    and pd.puzzle_date = date '2023-05-27'
)
and number = 1
and direction = 'across';

-- 14-Across: THETSA → THE TSA (3,3)
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
    and pd.puzzle_date = date '2023-05-27'
)
and number = 14
and direction = 'across';

-- 4-Down: ONADIET → ON A DIET (2,1,4)
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
    and pd.puzzle_date = date '2023-05-27'
)
and number = 4
and direction = 'down';