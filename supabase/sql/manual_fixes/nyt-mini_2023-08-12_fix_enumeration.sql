-- ===========================================
-- Script: nyt-mini_2023-08-12_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-27
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-08-12
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 8-Across: GETSON → GETS ON (4,2)
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
    and pd.puzzle_date = date '2023-08-12'
)
and number = 8
and direction = 'across';

-- 13-Across: ONMUTE → ON MUTE (2,4)
update clue_occurrence
set
  enumeration = '2,4',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-08-12'
)
and number = 13
and direction = 'across';

-- 4-Down: BTSARMY → BTS ARMY (3,4)
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
    and pd.puzzle_date = date '2023-08-12'
)
and number = 4
and direction = 'down';