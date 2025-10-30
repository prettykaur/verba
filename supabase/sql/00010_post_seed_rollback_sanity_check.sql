-- ===========================================
-- Script: 00010_post_seed_rollback_sanity_check.sql
-- Author: Pretty Kaur
-- Date: 2025-10-29
-- Purpose: Verify that seed rollback succeeded.
--           - Ensures no 'seed' source or puzzle_day entries remain
--           - Confirms data integrity across dependent tables
-- ===========================================

-- should be 0
select count(*) as seed_occ
from clue_occurrence co
join puzzle_day pd on pd.id = co.puzzle_day_id
join puzzle_source ps on ps.id = pd.source_id
where ps.slug = 'seed';

-- source removed?
select * from puzzle_source where slug = 'seed';
