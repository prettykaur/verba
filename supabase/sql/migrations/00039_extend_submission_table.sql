-- ===========================================
-- Script: 00039_extend_submission_table.sql
-- Author: Pretty Kaur
-- Date: 2026-01-15
-- Purpose:
--   - Extend public.submission for MVP-2 clue submissions:
--     * email (required)
--     * status (required, default 'pending')
--     * submitted_answer (optional)
--     * submitted_enumeration (optional)
--   - Backfill existing rows safely
-- ===========================================

-- 1) Add new columns as NULLABLE first (safe when existing rows exist)
alter table public.submission
  add column if not exists email text,
  add column if not exists status text,
  add column if not exists submitted_answer text,
  add column if not exists submitted_enumeration text;

-- 2) Backfill existing rows
update public.submission
set
  email = coalesce(email, 'test@tryverba.com'),
  status = coalesce(status, 'approved')
where email is null or status is null;

-- 3) Enforce required constraints + defaults
alter table public.submission
  alter column email set not null,
  alter column status set not null,
  alter column status set default 'pending';

-- 4) Index for admin dashboard
create index if not exists submission_status_idx
on public.submission (status);

-- 5) Status should only be valid values
alter table public.submission
  drop constraint if exists submission_status_check;

alter table public.submission
  add constraint submission_status_check
  check (status in ('pending', 'approved', 'rejected', 'duplicate'));
