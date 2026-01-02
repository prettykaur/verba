// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

/* =========================
   Types
========================= */

type DbRow = {
  occurrence_id: number;
  clue_text: string;
  answer_pretty: string | null;
  puzzle_date: string | null;
  source_name: string | null;
  source_slug: string | null;
  answer_len: number | null;
  number: number | null;
  direction: 'across' | 'down' | null;
};

type ApiResult = {
  id: number;
  occurrenceId: number;
  clue: string;
  answer: string;
  source: string;
  sourceSlug: string | null;
  date: string | null;
  number: number | null;
  direction: 'across' | 'down' | null;
  confidence: number;
};

/* =========================
   Helpers
========================= */

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

  // 3) answer contains query
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

  if (!baseLen || !patternLetters) return 0.3;

  const diff = Math.abs(baseLen - patternLetters);
  const score = 1 / (1 + diff); // 0.5 when off by 1, 1 when exact
  return score; // already 0–1
}

/* =========================
   Search Logging
========================= */

async function logSearchEvent({
  q,
  isPattern,
  sourceSlug,
  resultsCount,
  tookMs,
  ua,
  referrer,
  ip,
}: {
  q: string;
  isPattern: boolean;
  sourceSlug: string | null;
  resultsCount: number;
  tookMs: number;
  ua: string | null;
  referrer: string | null;
  ip: string | null;
}) {
  const ipHash = ip
    ? crypto.createHash('sha256').update(ip).digest('hex')
    : null;

  await supabase.from('search_event').insert({
    q,
    pattern: isPattern ? q : null,
    source_slug: sourceSlug,
    results: resultsCount,
    took_ms: tookMs,
    ua,
    referrer,
    ip_hash: ipHash,
  });
}

/* =========================
   API Route
========================= */

export async function GET(req: Request) {
  const start = Date.now();

  const { searchParams } = new URL(req.url);
  const rawQ = (searchParams.get('q') || '').trim();

  const ua = req.headers.get('user-agent');
  const referrer = req.headers.get('referer') ?? null;

  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip =
    forwardedFor?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;

  if (!rawQ) {
    await logSearchEvent({
      q: rawQ,
      isPattern: false,
      sourceSlug: null,
      resultsCount: 0,
      tookMs: Date.now() - start,
      ua,
      referrer,
      ip,
    });

    return NextResponse.json(
      { results: [] as ApiResult[], count: 0 },
      { headers: { 'cache-control': 'no-store' } },
    );
  }

  const isPattern = /[?*]/.test(rawQ);
  const likePattern = rawQ.replaceAll('*', '%').replaceAll('?', '_');

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
      source_slug,
      answer_len,
      number,
      direction
    `,
      { count: 'exact' },
    )
    // fetch a bit more and then rank client-side
    .limit(80);

  if (isPattern) {
    // pattern match on the pretty answer text (keep existing behaviour)
    query = query.ilike('answer_pretty', likePattern);
  } else {
    // normalise whitespace
    const collapsed = rawQ.replace(/\s+/g, ' ').trim();
    // strip punctuation per word so commas etc. don't break PostgREST .or()
    const tokens = collapsed
      .split(/\s+/)
      .map((w) => w.replace(/[^A-Za-z0-9]/g, ''))
      .filter(Boolean);

    if (tokens.length === 0) {
      await logSearchEvent({
        q: rawQ,
        isPattern,
        sourceSlug: null,
        resultsCount: 0,
        tookMs: Date.now() - start,
        ua,
        referrer,
        ip,
      });

      return NextResponse.json(
        { results: [] as ApiResult[], count: 0 },
        { headers: { 'cache-control': 'no-store' } },
      );
    }

    const orParts: string[] = [];
    for (const token of tokens) {
      // basic: match token anywhere in clue or pretty answer
      orParts.push(`clue_text.ilike.%${token}%`);
      orParts.push(`answer_pretty.ilike.%${token}%`);

      // bonus: handle dotted abbreviations like T.G.I.F. for query "TGIF"
      if (/^[A-Za-z]+$/.test(token) && token.length >= 2 && token.length <= 6) {
        const dotted = token.split('').join('.');
        orParts.push(`clue_text.ilike.%${dotted}%`);
        orParts.push(`answer_pretty.ilike.%${dotted}%`);
      }
    }

    query = query.or(orParts.join(','));
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('[/api/search] Supabase error:', error);
    return NextResponse.json(
      { results: [] as ApiResult[], count: 0 },
      { headers: { 'cache-control': 'no-store' } },
    );
  }

  const rows = (data ?? []) as DbRow[];

  // rank & map results
  const ranked = rows
    .map((r) => {
      const confidence = isPattern
        ? scorePatternQuery(rawQ, r)
        : scoreTextQuery(rawQ, r);

      return {
        id: r.occurrence_id,
        occurrenceId: r.occurrence_id,
        clue: r.clue_text,
        answer: r.answer_pretty ?? '',
        source: r.source_name ?? '',
        sourceSlug: r.source_slug,
        date: r.puzzle_date,
        number: r.number,
        direction: r.direction,
        confidence,
      };
    })
    .sort((a, b) => b.confidence - a.confidence);

  const top = ranked.slice(0, 25);

  await logSearchEvent({
    q: rawQ,
    isPattern,
    sourceSlug: top[0]?.sourceSlug ?? null,
    resultsCount: top.length,
    tookMs: Date.now() - start,
    ua,
    referrer,
    ip,
  });

  return NextResponse.json(
    { results: top, count: count ?? ranked.length },
    { headers: { 'cache-control': 'no-store' } },
  );
}
