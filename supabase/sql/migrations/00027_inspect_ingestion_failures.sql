-- ===========================================
-- Script: 00027_inspect_ingestion_failures.sql
-- Author: Pretty Kaur
-- Date: 2026-01-12
-- Purpose:
--   - Inspect ingestion failures logged in ingest_failures table
-- ===========================================

-- View all failures
select *
from ingest_failure
where source_slug = 'nyt-mini'
order by puzzle_date desc;

-- View failures for a specific range
select puzzle_date, stage, error
from ingest_failure
where source_slug = 'nyt-mini'
  and puzzle_date between date '2024-01-01' and date '2024-12-31'
order by puzzle_date;
