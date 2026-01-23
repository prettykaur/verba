-- ===========================================
-- Script: nyt-mini_2023-11-03_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-24
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2023-11-03
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 5-Across: ISEE → I SEE (1,3)
update clue_occurrence
set
  enumeration = '1,3',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2023-11-03'
)
and number = 5
and direction = 'across';