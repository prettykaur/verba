-- ===========================================
-- Script: nyt-mini_2026-02-21_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-02-21
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2026-02-21
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 10-Across: SELFOWN → SELF OWN (4,3)
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
    and pd.puzzle_date = date '2026-02-21'
)
and number = 10
and direction = 'across';

-- 1-Down: MODELUN → MODEL UN (5,2)
update clue_occurrence
set
  enumeration = '5,2',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2026-02-21'
)
and number = 1
and direction = 'down';