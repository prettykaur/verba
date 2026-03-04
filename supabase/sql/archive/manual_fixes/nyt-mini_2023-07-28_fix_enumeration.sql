-- ===========================================
-- Script: nyt-mini_2023-07-28_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-27
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-07-28
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 1-Across: FASTX → FAST X (4,1)
update clue_occurrence
set
  enumeration = '4,1',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-07-28'
)
and number = 1
and direction = 'across';

-- 6-Across: ADWAR → AD WAR (2,3)
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
    and pd.puzzle_date = date '2023-07-28'
)
and number = 6
and direction = 'across';

-- 2-Down: ADDUP → ADD UP (3,2)
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
    and pd.puzzle_date = date '2023-07-28'
)
and number = 2
and direction = 'down';