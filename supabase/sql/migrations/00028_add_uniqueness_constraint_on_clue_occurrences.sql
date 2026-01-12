-- ===========================================
-- Script: 00028_add_uniqueness_constraint_on_clue_occurrences.sql
-- Author: Pretty Kaur
-- Date: 2026-01-13
-- Purpose:
--   - Add correct uniqueness constraint on clue_occurrences table
--   - Enforces the real-world rule: A puzzle cannot have two clues with the same number and direction.
-- ===========================================

alter table clue_occurrence
add constraint clue_occurrence_unique_day_num_dir
unique (puzzle_day_id, number, direction);
