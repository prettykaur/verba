// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type DbRow = {
  occurrence_id: number;
  clue_text: string;
  answer_pretty: string | null;
  puzzle_date: string | null;
  source_name: string | null;
  answer_len: number | null;
};

type ApiResult = {
  id: number;
  clue: string;
  answer: string;
  source: string;
  date: string | null;
  confidence: number;
};

// --- simple helpers ---

function normalize(str: string | null | undefined): string {
  return (str ?? '').toLowerCase();
}

// scoring for normal (non-pattern) queries
function scoreTextQuery(q: string, row: DbRow): number {
  const qNorm = normalize(q);
  if (!qNorm) return 0;

  const clue = normalize(row.clue_text);
  const rawAns = row.answer_pretty ?? '';
  const answer = normalize(rawAns);

  let score = 0;

  // 1) exact matches (very strong)
  if (clue === qNorm) score += 60;
  if (answer === qNorm) score += 55;

  // 2) clue phrase matches
  if (clue.startsWith(qNorm)) score += 35;
  else if (clue.includes(qNorm)) score += 20;

  // 3) answer contains query (useful when people type answers)
  if (qNorm.length >= 3 && answer.includes(qNorm)) score += 25;

  // 4) per-word boosts (e.g. "Peru capital")
  const words = qNorm.split(/\s+/).filter((w) => w.length >= 3);
  for (const w of words) {
    if (clue.includes(w)) score += 6;
    if (answer.includes(w)) score += 4;
  }

  // 5) slight preference for shorter answers when searching answers
  if (answer && qNorm.length <= 4 && row.answer_len != null) {
    const diff = Math.abs(row.answer_len - qNorm.length);
    if (diff === 0) score += 10;
    else if (diff === 1) score += 4;
  }

  // clamp to [0, 1]
  const capped = Math.min(score, 100);
  return capped / 100;
}

// scoring for pattern queries (e.g. D?NIM, C?T*)
// prefer answers whose length is close to number of letters in the pattern
function scorePatternQuery(q: string, row: DbRow): number {
  const patternLetters = q.replace(/[^A-Za-z]/g, '').length;
  const baseLen =
    row.answer_len ??
    (row.answer_pretty ?? '').replace(/[^A-Za-z]/g, '').length;

  if (!baseLen || !patternLetters) return 0.3; // neutral-ish

  const diff = Math.abs(baseLen - patternLetters);
  const score = 1 / (1 + diff); // 0.5 when off by 1, 1 when exact
  return score; // already 0–1
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json(
      { results: [] as ApiResult[], count: 0 },
      { headers: { 'cache-control': 'no-store' } },
    );
  }

  const isPattern = /[?*]/.test(q);
  const likePattern = q.replaceAll('*', '%').replaceAll('?', '_');

  // Base select from pretty view, with extra columns for scoring
  let query = supabase
    .from('v_search_results_pretty')
    .select(
      `
      occurrence_id,
      clue_text,
      answer_pretty,
      puzzle_date,
      source_name,
      answer_len
    `,
      { count: 'exact' },
    )
    // fetch a bit more and then rank client-side
    .limit(80);

  if (isPattern) {
    // pattern match on the pretty answer text
    query = query.ilike('answer_pretty', likePattern);
  } else {
    // substring match on clue text OR pretty answer
    query = query.or(`clue_text.ilike.%${q}%,answer_pretty.ilike.%${q}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('[/api/search] Supabase error:', error);
    return NextResponse.json(
      { results: [] as ApiResult[], count: 0 },
      { status: 200, headers: { 'cache-control': 'no-store' } },
    );
  }

  const rows = (data ?? []) as DbRow[];

  // rank & map results
  const ranked = rows
    .map((r) => {
      const confidence = isPattern
        ? scorePatternQuery(q, r)
        : scoreTextQuery(q, r);

      return {
        id: r.occurrence_id,
        clue: r.clue_text,
        answer: r.answer_pretty ?? '',
        source: r.source_name ?? '',
        date: r.puzzle_date,
        confidence,
      } satisfies ApiResult;
    })
    // highest confidence first
    .sort((a, b) => b.confidence - a.confidence);

  const top = ranked.slice(0, 25);

  return NextResponse.json(
    { results: top, count: count ?? ranked.length },
    { headers: { 'cache-control': 'no-store' } },
  );
}
