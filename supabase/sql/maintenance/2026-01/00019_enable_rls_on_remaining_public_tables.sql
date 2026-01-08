-- ===========================================
-- Script: 00019_enable_rls_on_remaining_public_tables.sql
-- Author: Pretty Kaur
-- Date: 2026-01-06
-- Purpose:
--   - Enable RLS on remaining public tables flagged by Supabase
--   - Add explicit, minimal policies for anonymous usage
-- ===========================================

-- ======================
-- puzzle_type (read-only lookup)
-- ======================
alter table puzzle_type enable row level security;

do $$ begin
  create policy "public read puzzle_type"
    on puzzle_type
    for select
    using (true);
exception when duplicate_object then null; end $$;

-- ======================
-- search_event (anonymous insert-only analytics)
-- ======================
alter table search_event enable row level security;

do $$ begin
  create policy "public insert search_event"
    on search_event
    for insert
    with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "no public read search_event"
    on search_event
    for select
    using (false);
exception when duplicate_object then null; end $$;

-- ======================
-- staging_occurrence_seed (internal only)
-- ======================
alter table staging_occurrence_seed enable row level security;

do $$ begin
  create policy "no public access staging"
    on staging_occurrence_seed
    for all
    using (false)
    with check (false);
exception when duplicate_object then null; end $$;
