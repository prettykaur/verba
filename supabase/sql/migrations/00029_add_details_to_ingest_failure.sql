-- ===========================================
-- Script: 00029_add_details_to_ingest_failure.sql
-- Author: Pretty Kaur
-- Date: 2026-01-13
-- Purpose:
--   - Adds structured debugging support to the ingest failure logging system
-- ===========================================

alter table ingest_failure
add column if not exists details jsonb;
