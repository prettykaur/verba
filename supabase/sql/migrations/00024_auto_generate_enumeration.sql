-- ===========================================
-- Script: 00024_auto_generate_enumeration.sql
-- Author: Pretty Kaur
-- Date: 2026-01-12
-- Purpose:
--   - Auto-generate enumeration + answer_display when missing
-- ===========================================

create or replace function public.generate_enumeration(answer text)
returns text
language sql
immutable
as $$
  select string_agg(length(part)::text, ',')
  from regexp_split_to_table(answer, '\s+') part;
$$;
