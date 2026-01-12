-- ===========================================
-- Script: 00026_sanity_check_nyt-mini_ingestion_ranges.sql
-- Author: Pretty Kaur
-- Date: 2026-01-12
-- Purpose:
--   - Confirm dates exist when ingesting a range of dates from NYT Mini
--   - Confirm occurrences count for range ingestion
-- ===========================================

-- Confirm dates exist (range)
select
  ps.slug as source,
  count(*) as days
from puzzle_day pd
join puzzle_source ps on ps.id = pd.source_id
where ps.slug = 'nyt-mini'
  and pd.puzzle_date between date '2024-01-01' and date '2024-01-31'
group by ps.slug;

-- Confirm occurrences count (range)
select
  pd.puzzle_date,
  count(*) as occurrences
from clue_occurrence co
join puzzle_day pd on pd.id = co.puzzle_day_id
join puzzle_source ps on ps.id = pd.source_id
where ps.slug = 'nyt-mini'
  and pd.puzzle_date between date '2024-11-01' and date '2024-11-30'
group by pd.puzzle_date
order by pd.puzzle_date;
