-- ===========================================
-- Script: nyt-mini_2026-01-31_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-31
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2026-01-31
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 11-Across: DELICASE → DELI CASE (4,4)
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
    and pd.puzzle_date = date '2026-01-31'
)
and number = 11
and direction = 'across';

-- 4-Down: BETAAPP → BETA APP (4,3)
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
    and pd.puzzle_date = date '2026-01-31'
)
and number = 4
and direction = 'down';

-- 9-Down: ADDME → ADD ME (3,2)
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
    and pd.puzzle_date = date '2026-01-31'
)
and number = 9
and direction = 'down';