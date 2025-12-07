-- ===========================================
-- Script: 00018_rename_seed_source.sql
-- Author: Pretty Kaur
-- Date: 2025-12-07
-- ===========================================

-- Rename 'seed' source to a nicer display name
update puzzle_source
set name = 'Classic Crossword Clues'
where slug = 'seed';
