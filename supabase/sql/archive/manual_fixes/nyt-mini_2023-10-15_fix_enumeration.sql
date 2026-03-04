-- ===========================================
-- Script: nyt-mini_2023-10-15_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-26
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-10-15
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 8-Across: ORSO → OR SO (2,2)
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
    and pd.puzzle_date = date '2023-10-15'
)
and number = 8
and direction = 'across';

-- 3-Down: AGIRL → A GIRL (1,4)
update clue_occurrence
set
  enumeration = '1,4',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-10-15'
)
and number = 3
and direction = 'down';