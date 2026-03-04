-- ===========================================
-- Script: nyt-mini_2024-09-07_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-16
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-09-07
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 9-Across: TIMWALZ → TIM WALZ (3,4)
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
    and pd.puzzle_date = date '2024-09-07'
)
and number = 9
and direction = 'across';

-- 12-Across: POPHITS → POP HITS (3,4)
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
    and pd.puzzle_date = date '2024-09-07'
)
and number = 12
and direction = 'across';

-- 3-Down: MEMOPAD → MEMO PAD (4,3)
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
    and pd.puzzle_date = date '2024-09-07'
)
and number = 3
and direction = 'down';

-- 4-Down: TEATIME → TEA TIME (3,4)
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
    and pd.puzzle_date = date '2024-09-07'
)
and number = 4
and direction = 'down';