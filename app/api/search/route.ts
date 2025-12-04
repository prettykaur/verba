// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // uses your anon key (read-only)

type Row = {
  occurrence_id: number;
  clue_text: string;
  answer: string | null;
  answer_pretty: string | null;
  puzzle_date: string | null;
  source_name: string | null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json(
      { results: [], count: 0 },
      { headers: { 'cache-control': 'no-store' } },
    );
  }

  // Pattern mode: treat ? as single-letter wildcard, * as any-length wildcard
  const isPattern = /[?*]/.test(q);
  const likePattern = q.replaceAll('*', '%').replaceAll('?', '_');

  // Base select from your pretty view
  let query = supabase
    .from('v_search_results_pretty')
    .select(
      `
      occurrence_id,
      clue_text,
      answer,
      answer_pretty,
      puzzle_date,
      source_name
    `,
      { count: 'exact' },
    )
    .limit(25);

  if (isPattern) {
    // match on the ANSWER field (answers are stored uppercase in your pipeline)
    query = query.ilike('answer', likePattern);
  } else {
    // substring match on clue text OR answer
    query = query.or(
      `clue_text.ilike.%${q}%,answer.ilike.%${q.toUpperCase()}%`,
    );
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('[/api/search] Supabase error:', error);
    return NextResponse.json(
      { results: [], count: 0 },
      { status: 200, headers: { 'cache-control': 'no-store' } },
    );
  }

  const results = (data || []).map((r: Row) => ({
    id: r.occurrence_id,
    clue: r.clue_text,
    answer: r.answer_pretty ?? r.answer ?? '',
    source: r.source_name ?? '',
    date: r.puzzle_date,
  }));

  return NextResponse.json(
    { results, count: count ?? results.length },
    { headers: { 'cache-control': 'no-store' } },
  );
}
