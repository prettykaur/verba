-- ===========================================
-- Script: 00040_add_rls_to_submission_table.sql
-- Author: Pretty Kaur
-- Date: 2026-01-15
-- Purpose:
--   - Lock down public.submission with RLS
--   - Allow anon/authenticated INSERT only
--   - Block SELECT/UPDATE/DELETE for anon/authenticated
-- ===========================================

-- 1) Enable RLS
alter table public.submission enable row level security;

-- 2) Remove overly-broad grants (defense in depth)
revoke all on table public.submission from anon;
revoke all on table public.submission from authenticated;

-- 3) Allow inserts (API currently uses anon client)
grant insert on table public.submission to anon;
grant insert on table public.submission to authenticated;

-- 4) Drop old policies if any (safe re-runs)
drop policy if exists "submission_insert_anon" on public.submission;
drop policy if exists "submission_insert_authenticated" on public.submission;

-- 5) Create INSERT-only policies
create policy "submission_insert_anon"
on public.submission
for insert
to anon
with check (true);

create policy "submission_insert_authenticated"
on public.submission
for insert
to authenticated
with check (true);

-- No SELECT/UPDATE/DELETE policies are created.
-- With RLS enabled, those operations will be denied for anon/authenticated.
-- service_role bypasses RLS for admin actions.
