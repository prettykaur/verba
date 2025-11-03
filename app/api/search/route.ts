// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

function isPattern(q: string) {
  return /[?*]/.test(q);
}

// D?NIM -> D_NIM, D*IM -> D%IM
function toLikePattern(q: string) {
  return q.replace(/\?/g, '_').replace(/\*/g, '%');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get('q') || '').trim();
  if (!raw) return NextResponse.json({ results: [], count: 0 });

  const q = raw.slice(0, 200);
  const hasPattern = isPattern(q);

  // We query the view that already exposes: clue_text, answer, answer_pretty,
  // source_slug/source_name, puzzle_date, etc.
  let query = supabase
    .from('v_search_results_pretty')
    .select(
      'occurrence_id, clue_id, clue_text, answer, answer_len, answer_pretty, puzzle_date, source_slug, source_name',
      { count: 'exact' },
    )
    .limit(50)
    .order('puzzle_date', { ascending: false });

  if (hasPattern) {
    // pattern on ANSWER; match both raw and pretty answers
    const like = toLikePattern(q.toUpperCase()); // answers are usually stored uppercased
    // Supabase OR filter syntax
    query = query.or(`answer.ilike.${like},answer_pretty.ilike.${like}`);
  } else {
    // free-text match on clue OR answer
    const like = `%${q}%`;
    query = query.or(`clue_text.ilike.${like},answer.ilike.${like}`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 },
    );
  }

  // Map to your ResultItem props
  const results =
    (data || []).map((r) => ({
      id: r.occurrence_id,
      clue: r.clue_text,
      answer: r.answer_pretty || r.answer,
      source: r.source_slug, // or r.source_name if you prefer the long name
      date: r.puzzle_date,
      confidence: null, // not modeled (yet)
    })) ?? [];

  return NextResponse.json({ results, count: count ?? results.length });
}
