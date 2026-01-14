-- ===========================================
-- Script: 00033_backfill_enumeration_source.sql
-- Author: Pretty Kaur
-- Date: 2026-01-14
-- Purpose:
--   - Backfill enumeration_source for all existing occurrences
-- ===========================================

update public.clue_occurrence
set enumeration_source = 'derived'
where enumeration_source is null;
