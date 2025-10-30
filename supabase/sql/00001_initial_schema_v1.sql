-- ===========================================
-- Script: 00001_initial_schema_v1.sql
-- Author: Pretty Kaur
-- Date: 2025-10-13
-- Purpose: Initialize the core database schema for Verba.
--           - Defines base tables for puzzles, clues, words, and relationships
--           - Includes primary keys, foreign keys, and basic indexes
--           - Sets up enum types (e.g., direction enum: 'across' | 'down')
-- ===========================================

-- ===========================================
-- VERBA SCHEMA v1.0  (safe to re-run)
-- ===========================================

-- =========
-- Extensions
-- =========
create extension if not exists pg_trgm;
create extension if not exists citext;

-- ==========================
-- Core taxonomy / dimensions
-- ==========================
create table if not exists puzzle_type (
  id bigserial primary key,
  slug text unique not null,
  name text not null,
  description text,
  has_grid boolean default false,
  has_clues boolean default true,
  created_at timestamptz default now()
);

create table if not exists puzzle_source (
  id bigserial primary key,
  slug text unique not null,
  name text not null,
  url text,
  puzzle_type_id bigint references puzzle_type(id),
  timezone text,
  release_time_utc time
);

create table if not exists puzzle_day (
  id bigserial primary key,
  source_id bigint not null references puzzle_source(id) on delete cascade,
  puzzle_type_id bigint references puzzle_type(id),
  puzzle_date date not null,
  created_at timestamptz default now(),
  unique (source_id, puzzle_date)
);

-- =====================
-- Clues & occurrences
-- =====================
create table if not exists clue (
  id bigserial primary key,
  text text not null,
  slug text unique not null,
  ts tsvector generated always as (to_tsvector('english', text)) stored
);

-- Safe-create enum
do $$ begin
  create type dir as enum ('across','down');
exception when duplicate_object then null; end $$;

create table if not exists clue_occurrence (
  id bigserial primary key,
  puzzle_day_id bigint not null references puzzle_day(id) on delete cascade,
  clue_id bigint not null references clue(id) on delete cascade,
  number int,
  direction dir,
  answer text not null,
  answer_len smallint generated always as (char_length(answer)) stored,
  answer_norm text generated always as (upper(answer)) stored,
  word_id bigint,            -- FK added below
  source_url text,
  inserted_at timestamptz default now(),
  unique (puzzle_day_id, clue_id)
);

-- ======================
-- Global word dictionary
-- ======================
create table if not exists word (
  id bigserial primary key,
  text text unique not null,      -- store UPPER(TEXT)
  len  smallint generated always as (char_length(text)) stored,
  popularity int default 0,
  created_at timestamptz default now()
);

-- Safely add FK (rerun-safe)
do $$ begin
  alter table clue_occurrence
    add constraint clue_occurrence_word_fk
    foreign key (word_id) references word(id);
exception when duplicate_object then null; end $$;

-- =========================
-- Public forms / analytics
-- =========================
create table if not exists submission (
  id bigserial primary key,
  clue_text text not null,
  pattern text,
  source_slug text,
  created_at timestamptz default now()
);

create table if not exists newsletter_subscriber (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  created_at timestamptz default now()
);

create table if not exists search_event (
  id bigserial primary key,
  q text not null,
  pattern text,
  source_slug text,
  results int,
  took_ms int,
  referrer text,
  ua text,
  ip_hash text,
  created_at timestamptz default now()
);

-- =======
-- Indexes
-- =======
create index if not exists clue_ts_idx            on clue using gin (ts);
create index if not exists clue_trgm_idx          on clue using gin (text gin_trgm_ops);
create index if not exists occ_answer_norm_idx    on clue_occurrence (answer_norm);
create index if not exists occ_answer_len_idx     on clue_occurrence (answer_len);
create index if not exists occ_day_idx            on clue_occurrence (puzzle_day_id);
create index if not exists occ_word_idx           on clue_occurrence (word_id);
create index if not exists day_idx                on puzzle_day (source_id, puzzle_date desc);

-- =====
-- Views
-- =====
create or replace view v_search_results as
select
  c.id                as clue_id,
  c.text              as clue_text,
  co.answer,
  co.answer_len,
  co.word_id,
  w.text              as word_text,
  w.len               as word_len,
  pd.puzzle_date,
  ps.slug             as source_slug,
  ps.name             as source_name
from clue_occurrence co
join clue c           on c.id  = co.clue_id
join puzzle_day pd    on pd.id = co.puzzle_day_id
join puzzle_source ps on ps.id = pd.source_id
left join word w      on w.id  = co.word_id;

create or replace view v_word_usage as
select w.id as word_id, w.text, count(co.id) as uses
from word w
left join clue_occurrence co on co.word_id = w.id
group by w.id, w.text;

-- ===========
-- Seed values
-- ===========
insert into puzzle_type (slug, name, has_grid, has_clues)
values ('crossword','Crossword', true, true)
on conflict (slug) do nothing;

insert into puzzle_source (slug, name, puzzle_type_id)
select 'nyt-mini','NYT Mini', id
from puzzle_type where slug='crossword'
on conflict (slug) do nothing;

-- One sample day + clue + occurrence (for sanity checks)
insert into puzzle_day (source_id, puzzle_type_id, puzzle_date)
select ps.id, ps.puzzle_type_id, '2025-10-16'
from puzzle_source ps
where ps.slug='nyt-mini'
on conflict do nothing;

insert into clue (text, slug)
values ('Sushi seaweed','sushi-seaweed')
on conflict (slug) do nothing;

insert into clue_occurrence (puzzle_day_id, clue_id, number, direction, answer)
values (
  (select pd.id from puzzle_day pd join puzzle_source ps on ps.id=pd.source_id
   where ps.slug='nyt-mini' and pd.puzzle_date='2025-10-16'),
  (select id from clue where slug='sushi-seaweed'),
  2, 'across', 'NORI'
)
on conflict do nothing;

-- Backfill word links (safe re-run)
insert into word (text)
select distinct upper(answer) from clue_occurrence
on conflict (text) do nothing;

update clue_occurrence co
set word_id = w.id
from word w
where w.text = upper(co.answer) and co.word_id is null;

-- ===
-- RLS
-- ===
alter table clue                    enable row level security;
alter table clue_occurrence        enable row level security;
alter table puzzle_day             enable row level security;
alter table puzzle_source          enable row level security;
alter table submission             enable row level security;
alter table newsletter_subscriber  enable row level security;
alter table word                   enable row level security;

-- Idempotent policy creation
do $$ begin
  create policy "public read clue"
    on clue for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read occ"
    on clue_occurrence for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read day"
    on puzzle_day for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read src"
    on puzzle_source for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public read word"
    on word for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public insert submission"
    on submission for insert with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public insert newsletter"
    on newsletter_subscriber for insert with check (true);
exception when duplicate_object then null; end $$;
