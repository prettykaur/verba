-- ===========================================
-- Script: nyt-mini_2023-07-08_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-27
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-07-08
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 7-Across: TOREUP → TORE UP (4,2)
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
    and pd.puzzle_date = date '2023-07-08'
)
and number = 7
and direction = 'across';

-- 9-Across: EYEEXAM → EYE EXAM (3,4)
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
    and pd.puzzle_date = date '2023-07-08'
)
and number = 9
and direction = 'across';

-- 13-Across: NOGO → NO GO (2,2)
update clue_occurrence
set
  enumeration = '2,2',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-07-08'
)
and number = 13
and direction = 'across';

-- 8-Down: PANDG → P AND G (1,3,1)
update clue_occurrence
set
  enumeration = '1,3,1',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-07-08'
)
and number = 8
and direction = 'down';