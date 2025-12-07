-- ===========================================
-- Script: 00017_rebuild_answer_display_and_words.sql
-- Author: Pretty Kaur
-- Date: 2025-12-07
-- ===========================================

-- Clear word_id for all nyt-mini occurrences
update clue_occurrence co
set word_id = null
where exists (
  select 1
  from puzzle_day pd
  join puzzle_source ps
    on pd.source_id = ps.id
  where ps.slug = 'nyt-mini'
    and pd.id = co.puzzle_day_id
);

-- Rebuild word dictionary
insert into word (text)
select distinct upper(answer)
from clue_occurrence
on conflict (text) do nothing;

-- Re-link word_id
update clue_occurrence co
set word_id = w.id
from word w
where co.word_id is null
  and w.text = upper(co.answer);

-- Recompute answer_display for any row that has enumeration
update clue_occurrence
set answer_display = format_answer(answer, enumeration, ' ')
where enumeration is not null
  and enumeration <> '';
