-- ===========================================
-- Script: 00034_regenerate_answer_display.sql
-- Author: Pretty Kaur
-- Date: 2026-01-14
-- Purpose:
--   - Regenerate answer_display from (answer, enumeration)
--   - Support manual workflow and batch clean-up
-- ===========================================

create or replace function public.regenerate_answer_display(
  p_source_slug text,
  p_puzzle_date date,
  p_only_source text default null,          -- 'manual' or 'derived' or null (both)
  p_force boolean default false             -- if true, overwrite even if answer_display already exists
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update public.clue_occurrence co
  set answer_display = format_answer(co.answer, co.enumeration, ' ')
  from public.puzzle_day pd
  join public.puzzle_source ps on ps.id = pd.source_id
  where co.puzzle_day_id = pd.id
    and ps.slug = p_source_slug
    and pd.puzzle_date = p_puzzle_date
    and co.enumeration is not null
    and co.enumeration <> ''
    and (
      p_only_source is null
      or co.enumeration_source = p_only_source
    )
    and (
      p_force = true
      or co.answer_display is null
      or co.answer_display = ''
    );

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.regenerate_answer_display(text, date, text, boolean) from public;
