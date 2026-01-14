-- ===========================================
-- Script: 00032_add_enumeration_source_to_clue_occurrence.sql
-- Author: Pretty Kaur
-- Date: 2026-01-14
-- Purpose:
--   - Track whether enumeration was derived or manually curated
-- ===========================================

alter table public.clue_occurrence
add column if not exists enumeration_source text;

-- Optional: constrain values (recommended)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clue_occurrence_enumeration_source_check'
  ) then
    alter table public.clue_occurrence
    add constraint clue_occurrence_enumeration_source_check
    check (enumeration_source in ('derived', 'manual'));
  end if;
end$$;

-- Default everything to derived going forward
alter table public.clue_occurrence
alter column enumeration_source set default 'derived';
