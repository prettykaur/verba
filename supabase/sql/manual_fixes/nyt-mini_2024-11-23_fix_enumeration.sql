-- ===========================================
-- Script: nyt-mini_2024-11-23_fix_enumeration.sql
-- Author: Pretty Kaur
-- Fix date: 2026-01-14
-- Puzzle:
--   Source: NYT Mini
--   Puzzle date: 2024-11-23
-- Purpose:
--   - Manual enumeration corrections after review
--   - NYT Mini does not always provide word boundaries
-- ===========================================

-- 3-Down: NEWAGEY → NEW-AGEY (3,4)
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
    and pd.puzzle_date = date '2024-11-23'
)
and number = 3
and direction = 'down';
