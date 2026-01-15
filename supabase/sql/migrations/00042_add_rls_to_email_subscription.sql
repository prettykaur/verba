-- ===========================================
-- Script: 00042_add_rls_to_email_subscription.sql
-- Author: Pretty Kaur
-- Date: 2026-01-15
-- Purpose:
--   - Enable RLS on email_subscription
--   - Allow INSERT only for anon/authenticated
-- ===========================================

alter table public.email_subscription enable row level security;

revoke all on table public.email_subscription from anon;
revoke all on table public.email_subscription from authenticated;

grant insert on table public.email_subscription to anon;
grant insert on table public.email_subscription to authenticated;

drop policy if exists "email_subscription_insert_anon" on public.email_subscription;
drop policy if exists "email_subscription_insert_authenticated" on public.email_subscription;

create policy "email_subscription_insert_anon"
on public.email_subscription
for insert
to anon
with check (true);

create policy "email_subscription_insert_authenticated"
on public.email_subscription
for insert
to authenticated
with check (true);
