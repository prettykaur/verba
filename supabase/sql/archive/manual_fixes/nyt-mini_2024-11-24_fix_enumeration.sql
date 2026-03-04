-- ===========================================
-- Script: nyt-mini_2024-11-24_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix date: 2026-01-14
-- Puzzle:
--   Source: NYT Mini
--   Puzzle date: 2024-11-24
-- Purpose:
--   - Manual enumeration corrections after review
--   - NYT Mini does not always provide word boundaries
-- ===========================================

-- 8-Across: ONEND → ON END (2,3)
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
    and pd.puzzle_date = date '2024-11-24'
)
and number = 8
and direction = 'across';

-- 2-Down: ASONE → AS ONE (2,3)
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
    and pd.puzzle_date = date '2024-11-24'
)
and number = 2
and direction = 'down';
