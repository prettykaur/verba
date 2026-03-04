-- ===========================================
-- Script: nyt-mini_2026-02-07_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-02-07
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2026-02-07
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 7-Across: RUNAWAY → RUN AWAY (3,4)
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
    and pd.puzzle_date = date '2026-02-07'
)
and number = 7
and direction = 'across';

-- 8-Across: IMGOOD → IM GOOD (2,4)
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
    and pd.puzzle_date = date '2026-02-07'
)
and number = 8
and direction = 'across';

-- 2-Down: INTWOS → IN TWOS (2,4)
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
    and pd.puzzle_date = date '2026-02-07'
)
and number = 2
and direction = 'down';