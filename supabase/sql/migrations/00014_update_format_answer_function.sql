-- ===========================================
-- Script: 00014_update_format_answer_function.sql
-- Author: Pretty Kaur
-- Date: 2025-12-07
-- ===========================================

create or replace function format_answer(
  ans   text,
  enum  text,
  joiner text default ' '
)
returns text
language plpgsql
as $$
declare
  cleaned_enum text;
  parts        text[];
  part_len     int;
  pos          int := 1;
  out          text := '';
begin
  -- If no enumeration or no answer, just return the raw answer
  if enum is null
     or enum = ''
     or ans is null
     or ans = '' then
    return ans;
  end if;

  -- Normalise enumeration:
  --   - remove spaces
  --   - treat "-" the same as ","
  cleaned_enum := replace(replace(enum, ' ', ''), '-', ',');

  -- Split into an array of lengths: e.g. '1,3,3' -> ['1','3','3']
  parts := string_to_array(cleaned_enum, ',');

  foreach part_len in array parts loop
    if part_len is null then
      continue;
    end if;

    -- Safety: if the enumeration overruns the answer length, return answer raw
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
