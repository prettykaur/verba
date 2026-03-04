-- ===========================================
-- Script: nyt-mini_2023-12-16_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-24
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-12-16
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 8-Across: ONEWORD → ONE WORD (3,4)
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
    and pd.puzzle_date = date '2023-12-16'
)
and number = 8
and direction = 'across';

-- 2-Down: ONAWALK → ON A WALK (2,1,4)
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
    and pd.puzzle_date = date '2023-12-16'
)
and number = 2
and direction = 'down';

-- 3-Down: GOPOTTY → GO POTTY (2,5)
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
    and pd.puzzle_date = date '2023-12-16'
)
and number = 3
and direction = 'down';

-- 4-Down: GINUP → GIN UP (3,2)
update clue_occurrence
set
  enumeration = '3,2',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-12-16'
)
and number = 4
and direction = 'down';