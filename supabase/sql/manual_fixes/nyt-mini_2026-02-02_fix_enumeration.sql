-- ===========================================
-- Script: nyt-mini_2026-02-02_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-02-02
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2026-02-02
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 5-Across: INARUT → IN A RUT (2,1,3)
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
    and pd.puzzle_date = date '2026-02-02'
)
and number = 5
and direction = 'across';

-- 7-Across: ONFIRE → ON FIRE (2,4)
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
    and pd.puzzle_date = date '2026-02-02'
)
and number = 7
and direction = 'across';