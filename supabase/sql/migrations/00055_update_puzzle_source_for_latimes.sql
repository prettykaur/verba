-- ===========================================
-- Script: 00055_update_puzzle_source_for_latimes.sql
-- Author: Pretty Kaur
-- Date: 2026-05-10
-- Purpose:
-- - Update puzzle_source row manually to include URL, timezone, and puzzle_type ID for LA Times Crossword
-- ===========================================

update puzzle_source
set
  puzzle_type_id = 1,
  url = 'https://www.latimes.com/games/daily-crossword',
  timezone = 'America/Los_Angeles'
where slug = 'la-times';