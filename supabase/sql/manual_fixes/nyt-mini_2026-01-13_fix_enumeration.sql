-- ===========================================
-- Script: nyt-mini_2026-01-13_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix date: 2026-01-14
-- Puzzle:
--   Source: NYT Mini
--   Puzzle date: 2026-01-13
-- Purpose:
--   - Manual enumeration corrections after review
--   - NYT Mini does not always provide word boundaries
-- ===========================================

-- 7-Across: ONYOU → ON YOU (2,3)
update clue_occurrence
set
  enumeration = '2,3',
  enumeration_source = 'manual',
  answer_display = null
where puzzle_day_id = (
  select pd.id
  from puzzle_day pd
  join puzzle_source ps on ps.id = pd.source_id
  where ps.slug = 'nyt-mini'
    and pd.puzzle_date = date '2026-01-13'
)
and number = 7
and direction = 'across';

-- 1-Down: ATON → A TON (1,3)
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
    and pd.puzzle_date = date '2026-01-13'
)
and number = 1
and direction = 'down';

-- 2-Down: OHNO → OH NO (2,2)
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
    and pd.puzzle_date = date '2026-01-13'
)
and number = 2
and direction = 'down';