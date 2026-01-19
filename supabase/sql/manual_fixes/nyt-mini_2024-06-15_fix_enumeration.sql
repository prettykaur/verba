-- ===========================================
-- Script: nyt-mini_2024-06-15_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix Date: 2026-01-19
-- Purpose:
--   - Manual enumeration correction
--   - Source: NYT Mini
--   - Puzzle Date: 2024-06-15
--   - Reason: MOO DENG is two words (3,4) (example)
-- ===========================================

-- 6-Across: TIEDON → TIED ON (4,2)
update clue_occurrence
set
  enumeration = '4,2',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-06-15'
)
and number = 6
and direction = 'across';

-- 8-Across: OLDSOUL → OLD SOUL (3,4)
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
    and pd.puzzle_date = date '2024-06-15'
)
and number = 8
and direction = 'across';

-- 12-Across: TEAMUSA → TEAM USA (4,3)
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
    and pd.puzzle_date = date '2024-06-15'
)
and number = 12
and direction = 'across';

-- 14-Across: RRATED → R RATED (1,5)
update clue_occurrence
set
  enumeration = '1,5',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2024-06-15'
)
and number = 14
and direction = 'across';

-- 3-Down: REDCARD → RED CARD (3,4)
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
    and pd.puzzle_date = date '2024-06-15'
)
and number = 3
and direction = 'down';

-- 5-Down: TOOCUTE → TOO CUTE (3,4)
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
    and pd.puzzle_date = date '2024-06-15'
)
and number = 5
and direction = 'down';