-- ===========================================
-- Script: 00023_sanity_check_nyt-mini_ingestion.sql
-- Author: Pretty Kaur
-- Date: 2026-03-04
-- Purpose:
--   - Audit NYT Mini data ingestion
-- ===========================================

select
  ps.slug        as source_slug,
  pd.puzzle_date,
  co.number,
  co.direction,
  c.text as clue,
  co.answer,
  co.answer_len
from clue_occurrence co
join clue c on c.id = co.clue_id
join puzzle_day pd on pd.id = co.puzzle_day_id
join puzzle_source ps on ps.id = pd.source_id
where
  ps.slug = 'nyt-mini'
  and pd.puzzle_date = date '2026-03-02'
  -- or a range:
  -- and pd.puzzle_date between date '2022-03-01' and date '2022-03-31'
order by
  pd.puzzle_date,
  co.direction,
  co.number;

-- Any missing clue text or answer?
select
  co.id,
  pd.puzzle_date,
  co.number,
  co.direction,
  c.text as clue,
  co.answer
from clue_occurrence co
join clue c on c.id = co.clue_id
join puzzle_day pd on pd.id = co.puzzle_day_id
join puzzle_source ps on ps.id = pd.source_id
where ps.slug = 'nyt-mini'
  and pd.puzzle_date = date '2026-03-02'
  and (
    c.text is null or btrim(c.text) = ''
    or co.answer is null or btrim(co.answer) = ''
  );

-- Any duplicate (day, number, direction) rows?
select
  pd.puzzle_date,
  co.direction,
  co.number,
  count(*) as n
from clue_occurrence co
join puzzle_day pd on pd.id = co.puzzle_day_id
join puzzle_source ps on ps.id = pd.source_id
where ps.slug = 'nyt-mini'
  and pd.puzzle_date = date '2026-03-02'
group by
  pd.puzzle_date, co.direction, co.number
having count(*) > 1
order by n desc, co.direction, co.number;