-- ===========================================
-- Script: 00011_post_seed_processing_sanity_check.sql
-- Author: Pretty Kaur
-- Date: 2025-10-30
-- Purpose: Validate successful promotion of seed data.
--           - Confirms normalized clues, words, and occurrences are present
--           - Checks for duplicates, missing slugs, or null fields
-- ===========================================

-- Total occurrences promoted
select count(*) as total_occ from clue_occurrence;

-- Any occurrences with empty/short answers?
select count(*) as short_ans
from clue_occurrence
where answer is null or length(answer) < 2;

-- Top 20 answers by frequency (spot excessive repeats)
select upper(answer) as ans, count(*) as uses
from clue_occurrence
group by 1
order by uses desc
limit 20;

-- Any orphaned occurrences without a word link?
select count(*) as missing_word_link
from clue_occurrence
where word_id is null;

-- Verify pretty view outputs rows (used by your /search)
select * from v_search_results_pretty limit 10;
