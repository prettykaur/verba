-- ===========================================
-- Script: 00052_archive_views.sql
-- Author: Pretty Kaur
-- Date: 2026-02-17
-- Purpose:
--   - Views: v_archive_years, v_archive_months
--   - Power /answers/[source]/YYYY and /answers/[source]/YYYY/MM
--   - Power archive sitemap generation without scanning entire puzzle_day
-- ===========================================

create or replace view v_archive_years as
select
  ps.slug as source_slug,
  (extract(year from pd.puzzle_date))::int as year,
  max(pd.puzzle_date) as lastmod,
  count(*)::int as day_count
from puzzle_day pd
join puzzle_source ps on ps.id = pd.source_id
group by ps.slug, (extract(year from pd.puzzle_date))::int;

create or replace view v_archive_months as
select
  ps.slug as source_slug,
  (extract(year from pd.puzzle_date))::int as year,
  lpad((extract(month from pd.puzzle_date))::int::text, 2, '0') as month,
  max(pd.puzzle_date) as lastmod,
  count(*)::int as day_count
from puzzle_day pd
join puzzle_source ps on ps.id = pd.source_id
group by
  ps.slug,
  (extract(year from pd.puzzle_date))::int,
  lpad((extract(month from pd.puzzle_date))::int::text, 2, '0');