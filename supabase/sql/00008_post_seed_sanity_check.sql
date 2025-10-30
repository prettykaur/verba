-- ===========================================
-- Script: 00008_post_seed_sanity_check.sql
-- Author: Pretty Kaur
-- Date: 2025-10-28
-- Purpose: Quick sanity check after initial seed import.
--           - Validates that staging data matches expected structure
--           - Inspects row count, sample clue_text, and answer fields
-- ===========================================

-- How many staging rows
select count(*) from staging_occurrence_seed;

-- How many promoted (live) rows
select count(*) from clue_occurrence co
join puzzle_day pd on pd.id = co.puzzle_day_id
join puzzle_source ps on ps.id = pd.source_id
where ps.slug = 'seed';

-- Spot-check a few promoted rows
select clue_text, answer, enumeration, answer_display, puzzle_date, source_name
from v_search_results_pretty
order by random()
limit 10;
