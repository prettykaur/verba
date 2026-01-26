-- ===========================================
-- Script: nyt-mini_2023-10-07_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-26
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-10-07
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 12-Across: UNDERGOD → UNDER GOD (5,3)
update clue_occurrence
set
  enumeration = '5,3',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-10-07'
)
and number = 12
and direction = 'across';

-- 14-Across: AGUY → A GUY (1,3)
update clue_occurrence
set
  enumeration = '1,3',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-10-07'
)
and number = 14
and direction = 'across';

-- 6-Down: EATOUT → EAT OUT (3,3)
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
    and pd.puzzle_date = date '2023-10-07'
)
and number = 6
and direction = 'down';

-- 7-Down: TIEDYE → TIE DYE (3,3)
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
    and pd.puzzle_date = date '2023-10-07'
)
and number = 7
and direction = 'down';