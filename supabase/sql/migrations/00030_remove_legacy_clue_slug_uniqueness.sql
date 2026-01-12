-- ===========================================
-- Script: 00030_remove_legacy_clue_slug_uniqueness.sql
-- Author: Pretty Kaur
-- Date: 2026-01-13
-- Purpose:
--   - Removes an incorrect uniqueness assumption on clue slugs.
-- ===========================================

alter table clue
drop constraint if exists clue_slug_key;
