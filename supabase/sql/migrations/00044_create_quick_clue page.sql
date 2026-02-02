-- ===========================================
-- Script: 00044_create_quick_clue page.sql
-- Author: Pretty Kaur
-- Date: 2026-02-02
-- Purpose:
--   - Render quick clue pages with deterministic slugs
--   - Generate sitemap
--   - "is_live" gating and lastmod support
--   - Later monetisation support
-- ===========================================

create table if not exists public.quick_clue_page (
  id bigserial primary key,

  -- what the page is about
  phrase text not null,
  answer_len smallint null,

  -- url identifier
  slug text not null unique,

  -- quality + control
  is_live boolean not null default true,

  -- refresh/sitemap metadata
  generated_at timestamptz not null default now(),
  last_seen date null,
  occurrences_count int not null default 0
);

create index if not exists quick_clue_page_live_idx
  on public.quick_clue_page (is_live);

create index if not exists quick_clue_page_len_idx
  on public.quick_clue_page (answer_len);

create index if not exists quick_clue_page_last_seen_idx
  on public.quick_clue_page (last_seen desc);
