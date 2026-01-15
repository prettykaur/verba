-- ===========================================
-- Script: 00041_create_email_subscription.sql
-- Author: Pretty Kaur
-- Date: 2026-01-15
-- Purpose:
--   - Store email subscribers for Verba
--   - Write-only for anon users
-- ===========================================

create table if not exists public.email_subscription (
  id bigserial primary key,
  email text not null,
  source text null,
  status text not null default 'active',
  created_at timestamptz not null default now(),

  constraint email_subscription_email_unique unique (email),
  constraint email_subscription_status_check
    check (status in ('active', 'unsubscribed'))
);
