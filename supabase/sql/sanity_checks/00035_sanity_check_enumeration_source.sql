-- ===========================================
-- Script: 00035_sanity_check_enumeration_source.sql
-- Author: Pretty Kaur
-- Date: 2026-01-14
-- Purpose:
--   - Sanity check: enumeration_source must be set (should be 0)
-- ===========================================

-- Any null provenance is a bug
select count(*) as null_enumeration_source
from clue_occurrence
where enumeration_source is null;
