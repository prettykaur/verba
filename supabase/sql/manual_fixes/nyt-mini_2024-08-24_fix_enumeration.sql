-- ===========================================
-- Script: nyt-mini_2024-08-24_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-17
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-08-24
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 9-Across: SWIMCAP → SWIM CAP (4,3)
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
    and pd.puzzle_date = date '2024-08-24'
)
and number = 9
and direction = 'across';

-- 12-Across: SIPON → SIP ON (3,2)
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
    and pd.puzzle_date = date '2024-08-24'
)
and number = 12
and direction = 'across';