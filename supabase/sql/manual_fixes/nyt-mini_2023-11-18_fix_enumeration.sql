-- ===========================================
-- Script: nyt-mini_2023-11-18_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-24
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-11-18
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 4-Across: LEPEW → LE PEW (2,3)
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
    and pd.puzzle_date = date '2023-11-18'
)
and number = 4
and direction = 'across';

-- 9-Across: SKIPASS → SKI PASS (3,4)
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
    and pd.puzzle_date = date '2023-11-18'
)
and number = 9
and direction = 'across';

-- 2-Down: UPTOPAR → UP TO PAR (2,2,3)
update clue_occurrence
set
  enumeration = '2,2,3',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-11-18'
)
and number = 2
and direction = 'down';