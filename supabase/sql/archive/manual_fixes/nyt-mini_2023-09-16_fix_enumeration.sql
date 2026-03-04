-- ===========================================
-- Script: nyt-mini_2023-09-16_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-26
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-09-16
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 7-Across: ALLDAY → ALL DAY (3,3)
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
    and pd.puzzle_date = date '2023-09-16'
)
and number = 7
and direction = 'across';

-- 12-Across: WORKUP → WORK UP (4,2)
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
    and pd.puzzle_date = date '2023-09-16'
)
and number = 12
and direction = 'across';

-- 6-Down: TALKTO → TALK TO (4,2)
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
    and pd.puzzle_date = date '2023-09-16'
)
and number = 6
and direction = 'down';