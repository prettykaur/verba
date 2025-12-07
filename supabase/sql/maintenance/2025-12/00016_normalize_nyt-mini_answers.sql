-- ===========================================
-- Script: 00016_normalize_nyt-mini_answers.sql
-- Author: Pretty Kaur
-- Date: 2025-12-07
-- ===========================================

-- For nyt-mini only, strip out spaces and punctuation from answer,
-- keep only A–Z and digits.
update clue_occurrence co
set answer = regexp_replace(upper(answer), '[^A-Z0-9]', '', 'g')
where exists (
  select 1
  from puzzle_day pd
  join puzzle_source ps
    on pd.source_id = ps.id
  where ps.slug = 'nyt-mini'
    and pd.id = co.puzzle_day_id
);
