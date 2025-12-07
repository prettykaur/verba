-- ===========================================
-- Script: 00009_rollback_seed_data.sql
-- Author: Pretty Kaur
-- Date: 2025-10-28
-- Purpose: Roll back all data imported from the seed source.
--           - Deletes all occurrences, puzzle_day, and puzzle_source with slug='seed'
--           - Safely preserves canonical word and clue tables
-- ===========================================

begin;

-- 1) Delete occurrences for the 'seed' source
delete from clue_occurrence co
using puzzle_day pd, puzzle_source ps
where co.puzzle_day_id = pd.id
  and pd.source_id = ps.id
  and ps.slug = 'seed';

-- 2) Delete the days for that source
delete from puzzle_day pd
using puzzle_source ps
where pd.source_id = ps.id
  and ps.slug = 'seed';

-- 3) Delete the source itself
delete from puzzle_source
where slug = 'seed';

-- 4) (Optional) Clean up orphan words/clues created only by the seed
--    Run these only if you want a fully clean slate.
-- delete from word
-- where id not in (select distinct word_id from clue_occurrence where word_id is not null);

-- delete from clue
-- where id not in (select distinct clue_id from clue_occurrence);

commit;
