-- ===========================================
-- Script: nyt-mini_2024-09-28_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-16
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-09-28
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 10-Across: PETDOGS → PET DOGS (3,4)
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
    and pd.puzzle_date = date '2024-09-28'
)
and number = 10
and direction = 'across';

-- 3-Down: STEPONE → STEP ONE (4,3)
update clue_occurrence
set
  enumeration = '4,3',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-09-28'
)
and number = 3
and direction = 'down';

-- 4-Down: TEAEGG → TEA EGG (3,3)
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
    and pd.puzzle_date = date '2024-09-28'
)
and number = 4
and direction = 'down';