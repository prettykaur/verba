-- ===========================================
-- Script: 00038_add_enumeration_source_to_staging_occurrence_seed.sql
-- Author: Pretty Kaur
-- Date: 2026-01-14
-- Purpose:
--   - Add column for enumeration_source to staging_occurrence_seed table
--   - Ensures future ingestion fills enumeration_source at staging
-- ===========================================

alter table staging_occurrence_seed
add column if not exists enumeration_source text;

