-- ===========================================
-- Script: 00020_fix_function_search_path.sql
-- Author: Pretty Kaur
-- Date: 2026-01-06
-- Purpose:
--   - Lock down search_path for helper functions
--   - Prevent search_path hijacking
-- ===========================================

-- format_answer
create or replace function format_answer(
  ans text,
  enum text,
  joiner text default ' '
)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  cleaned_enum text;
  parts        text[];
  part_len     int;
  pos          int := 1;
  out          text := '';
begin
  if enum is null or enum = '' or ans is null or ans = '' then
    return ans;
  end if;

  cleaned_enum := replace(replace(enum, ' ', ''), '-', ',');
  parts := string_to_array(cleaned_enum, ',');

  foreach part_len in array parts loop
    if pos + part_len - 1 > char_length(ans) then
      return ans;
    end if;

    if out <> '' then
      out := out || coalesce(joiner, ' ');
    end if;

    out := out || substring(ans from pos for part_len);
    pos := pos + part_len;
  end loop;

  return out;
end;
$$;

-- slugify
create or replace function slugify(s text)
returns text
language sql
immutable
security invoker
set search_path = public
as $$
  select regexp_replace(
           regexp_replace(lower(coalesce(s,'')), '\s+', '-', 'g'),
           '[^a-z0-9\-]', '', 'g'
         )
$$;
