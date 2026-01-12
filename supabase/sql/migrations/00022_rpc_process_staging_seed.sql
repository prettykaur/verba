-- ===========================================
-- Script: 00022_rpc_process_staging_seed.sql
-- Author: Pretty Kaur
-- Date: 2026-01-12
-- Purpose:
--   - Wraps staging promotion SQL in a callable RPC
-- ===========================================

create or replace function public.process_staging_occurrence_seed()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 0) Ensure base puzzle_type exists
  insert into puzzle_type (slug, name, has_grid, has_clues)
  values ('crossword','Crossword', true, true)
  on conflict (slug) do nothing;

  -- 1) Ensure puzzle_source rows exist for any source_slug in staging
  insert into puzzle_source (slug, name, puzzle_type_id)
  select
    s.source_slug,
    initcap(replace(coalesce(nullif(s.source_slug,''), 'seed'), '-', ' ')) as name,
    pt.id as puzzle_type_id
  from (
    select distinct coalesce(nullif(source_slug,''), 'seed') as source_slug
    from staging_occurrence_seed
  ) s
  cross join puzzle_type pt
  where pt.slug = 'crossword'
  on conflict (slug) do nothing;

  -- 2) Ensure puzzle_day exists for each (source_slug, puzzle_date)
  insert into puzzle_day (source_id, puzzle_type_id, puzzle_date)
  select
    ps.id,
    ps.puzzle_type_id,
    coalesce(s.puzzle_date, date '2025-01-01') as puzzle_date
  from staging_occurrence_seed s
  join puzzle_source ps
    on ps.slug = coalesce(nullif(s.source_slug,''), 'seed')
  group by
    ps.id,
    ps.puzzle_type_id,
    coalesce(s.puzzle_date, date '2025-01-01')
  on conflict (source_id, puzzle_date) do nothing;

  -- 3) Upsert CLUES using slug_md5 as the true unique key.
  --    IMPORTANT: use a slug that cannot collide.
  insert into clue (text, slug, slug_md5, slug_readable)
  select distinct
    s.clue_text,
    slugify(s.clue_text) || '-' || substr(md5(s.clue_text), 1, 8) as slug,
    coalesce(nullif(s.slug_md5,''), md5(s.clue_text)) as slug_md5,
    coalesce(nullif(s.slug_readable,''), slugify(s.clue_text)) as slug_readable
  from staging_occurrence_seed s
  where s.clue_text is not null
  on conflict (slug_md5) do update
    set text = excluded.text,
        slug_readable = excluded.slug_readable;

  -- 4a) Remove existing occurrences for this puzzle day
  delete from clue_occurrence co
  using puzzle_day pd, puzzle_source ps
  where co.puzzle_day_id = pd.id
    and pd.source_id = ps.id
    and ps.slug in (
      select distinct source_slug from staging_occurrence_seed
    )
    and pd.puzzle_date in (
      select distinct puzzle_date from staging_occurrence_seed
    );

  -- 4b) Insert fresh occurrences
  insert into clue_occurrence (
    puzzle_day_id,
    clue_id,
    number,
    direction,
    answer,
    enumeration,
    source_url,
    answer_display
  )
  select
    pd.id,
    c.id,
    s.number,
    s.direction,
    upper(s.answer),
    nullif(s.enumeration,''),
    nullif(s.source_url,''),
    nullif(s.answer_display,'')
  from staging_occurrence_seed s
  join puzzle_source ps
    on ps.slug = coalesce(nullif(s.source_slug,''), 'seed')
  join puzzle_day pd
    on pd.source_id = ps.id
  and pd.puzzle_date = s.puzzle_date
  join clue c
    on c.slug_md5 = s.slug_md5;

  -- 5) Maintain WORD dictionary + link
  insert into word (text)
  select distinct upper(answer)
  from clue_occurrence
  on conflict (text) do nothing;

  update clue_occurrence co
  set word_id = w.id
  from word w
  where co.word_id is null
    and w.text = upper(co.answer);

  -- 6) Fill answer_display using enumeration if provided (only when missing)
  update clue_occurrence
  set answer_display = format_answer(answer, enumeration, ' ')
  where enumeration is not null
    and enumeration <> ''
    and answer_display is null;
end;
$$;

revoke all on function public.process_staging_occurrence_seed() from public;
