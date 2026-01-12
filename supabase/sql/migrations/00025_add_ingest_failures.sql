-- ===========================================
-- Script: 00025_add_ingest_failures.sql
-- Author: Pretty Kaur
-- Date: 2026-01-12
-- Purpose:
--   - Log data ingestion failures to Supabase ingest_failure table
-- ===========================================

create table if not exists public.ingest_failure (
  id bigserial primary key,
  source_slug text not null,
  puzzle_date date not null,
  stage text not null default 'fetch',
  error text not null,
  created_at timestamptz not null default now(),
  unique (source_slug, puzzle_date, stage)
);

create index if not exists ingest_failure_idx
on public.ingest_failure (source_slug, puzzle_date desc);
