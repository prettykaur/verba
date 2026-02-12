// lib/getCommonAnswers.ts
import { supabase } from '@/lib/supabase';

export const PAGE_SIZE = 100;

type Options = {
  letter?: string;
  length?: { type: 'eq' | 'gte'; value: number };
  page: number;
};

export async function getCommonAnswers({ letter, length, page }: Options) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('v_answer_stats')
    .select(
      'answer_key, answer_len, occurrence_count, last_seen, last_seen_source_slug',
      { count: 'exact' },
    )
    .order('occurrence_count', { ascending: false });

  if (letter) {
    query = query.ilike('answer_key', `${letter}%`);
  }

  if (length) {
    if (length.type === 'eq') {
      query = query.eq('answer_len', length.value);
    } else {
      query = query.gte('answer_len', length.value);
    }
  }

  const { data, count } = await query.range(from, to);

  return {
    rows: data ?? [],
    total: typeof count === 'number' ? count : null,
  };
}
