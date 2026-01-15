-- ===========================================
-- Script: nyt-mini_2024-10-26_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-15
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-10-26
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 6-Across: HOTTOGO → HOT TO GO (3,2,2)
update clue_occurrence
set
  enumeration = '3,2,2',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-10-26'
)
and number = 6
and direction = 'across';

-- 10-Across: DEEPEND → DEEP END (4,3)
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
    and pd.puzzle_date = date '2024-10-26'
)
and number = 10
and direction = 'across';

-- 1-Down: ARTDECO → ART DECO (3,4)
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
    and pd.puzzle_date = date '2024-10-26'
)
and number = 1
and direction = 'down';

-- 3-Down: IVOTENO → I VOTE NO (1,4,2)
update clue_occurrence
set
  enumeration = '1,4,2',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-10-26'
)
and number = 3
and direction = 'down';