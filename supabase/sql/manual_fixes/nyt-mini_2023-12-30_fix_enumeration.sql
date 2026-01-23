-- ===========================================
-- Script: nyt-mini_2023-12-30_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-24
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-12-30
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 8-Across: NAILHOLE → NAIL HOLE (4,4)
update clue_occurrence
set
  enumeration = '4,4',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-12-30'
)
and number = 8
and direction = 'across';

-- 11-Across: THEVOICE → THE VOICE (3,5)
update clue_occurrence
set
  enumeration = '3,5',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-12-30'
)
and number = 11
and direction = 'across';

-- 1-Down: INATIE → IN A TIE (2,1,3)
update clue_occurrence
set
  enumeration = '2,1,3',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-12-30'
)
and number = 1
and direction = 'down';

-- 4-Down: OHNO → OH NO (2,2)
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
    and pd.puzzle_date = date '2023-12-30'
)
and number = 4
and direction = 'down';