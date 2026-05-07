// app/answers/common/length/[length]/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { PAGE_SIZE } from '@/lib/getCommonAnswers';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600;

const BASE_URL = 'https://tryverba.com';

type PageProps = {
  params: Promise<{ length: string }>;
  searchParams?: Promise<{ page?: string }>;
};

type CommonAnswerRow = {
  answer_key: string;
  answer_len: number;
  occurrence_count: number;
  last_seen: string | null;
  last_seen_source_slug: string | null;
  last_seen_occurrence_id: number | null;
};

function parseLengthParam(param: string) {
  if (param === '8-plus') {
    return { type: 'gte' as const, value: 8 };
  }

  const match = param.match(/^(\d+)-letter$/);
  if (!match) return null;

  return { type: 'eq' as const, value: Number(match[1]) };
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { length } = await params;
  const parsed = parseLengthParam(length);

  if (!parsed) {
    return { title: 'Common Crossword Answers | Verba' };
  }

  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page ?? 1));

  const label =
    parsed.type === 'eq' ? `${parsed.value}-Letter` : `${parsed.value}+ Letter`;

  const canonical =
    page === 1
      ? `${BASE_URL}/answers/common/length/${length}`
      : `${BASE_URL}/answers/common/length/${length}?page=${page}`;

  return {
    title: `Most Common ${label} Crossword Answers | Verba`,
    description: `Browse the most common ${label.toLowerCase()} crossword answers.`,
    alternates: { canonical },
    robots: {
      index: page === 1,
      follow: true,
    },
  };
}

export default async function CommonAnswersByLength({
  params,
  searchParams,
}: PageProps) {
  const { length } = await params;
  const parsed = parseLengthParam(length);
  if (!parsed) notFound();

  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page ?? 1));

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('v_answer_stats')
    .select(
      'answer_key, answer_len, occurrence_count, last_seen, last_seen_source_slug, last_seen_occurrence_id',
    )
    .order('occurrence_count', { ascending: false })
    .order('last_seen', { ascending: false });

  if (parsed.type === 'eq') {
    query = query.eq('answer_len', parsed.value);
  } else {
    query = query.gte('answer_len', parsed.value);
  }

  const { data, error } = await query.range(from, to + 1);

  if (error) {
    console.error(
      '[common length page] Supabase error:',
      JSON.stringify(error, null, 2),
    );
    notFound();
  }

  const fetchedRows = (data ?? []) as CommonAnswerRow[];
  const hasNext = fetchedRows.length > PAGE_SIZE;
  const rows = fetchedRows.slice(0, PAGE_SIZE);

  if (rows.length === 0) {
    notFound();
  }

  const hasPrev = page > 1;

  const start = from + 1;
  const end = from + rows.length;
  const approxTotal = hasNext ? `${end}+` : end;

  const lengthLabel =
    parsed.type === 'eq' ? `${parsed.value}-letter` : `${parsed.value}+ letter`;

  const lengths = [3, 4, 5, 6, 7];

  const patternLetters = ['A', 'E', 'S', 'T', 'R', 'O'];
  const patternLength = parsed.type === 'eq' ? parsed.value : 8;

  const browsePatterns = patternLetters.map((letter) => ({
    label: `${patternLength}-letter answers starting with ${letter}`,
    pattern: `${letter}${'_'.repeat(patternLength - 1)}`,
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/answers/common"
        className="verba-link text-sm text-verba-blue"
      >
        ← Back to All Common Answers
      </Link>

      <h1 className="text-2xl font-bold">
        Most Common {lengthLabel} Crossword Answers
      </h1>

      <p className="max-w-3xl text-slate-600">
        These are the most frequently used {lengthLabel} crossword answers
        across major puzzle sources.
      </p>

      <section className="flex flex-wrap gap-2 text-sm">
        {lengths.map((n) => {
          const slug = `${n}-letter`;
          const active = parsed.type === 'eq' && parsed.value === n;

          return (
            <Link
              key={n}
              href={`/answers/common/length/${slug}`}
              className={`rounded-full border px-3 py-1 ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'border-slate-200 text-verba-blue'
              }`}
            >
              {n}-letter
            </Link>
          );
        })}

        <Link
          href="/answers/common/length/8-plus"
          className="rounded-full border border-slate-200 px-3 py-1 text-verba-blue"
        >
          8+ letters
        </Link>
      </section>

      <section className="rounded-xl border bg-slate-50 p-4 text-sm">
        <h2 className="font-semibold text-slate-900">Browse by pattern</h2>
        <p className="mt-1 text-slate-600">
          Explore {lengthLabel} crossword answers by starting letter pattern.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {browsePatterns.map((p) => (
            <Link
              key={p.pattern}
              href={`/pattern/${encodeURIComponent(p.pattern)}`}
              className="btn-press btn-marigold-hover rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-verba-blue"
            >
              {p.pattern}
            </Link>
          ))}
        </div>
      </section>

      <div className="text-sm text-slate-600">
        Showing <strong>{start.toLocaleString()}</strong> to{' '}
        <strong>{end.toLocaleString()}</strong> of{' '}
        <strong>{approxTotal}</strong> answers
      </div>

      <section className="rounded-xl border bg-white">
        <ul className="divide-y">
          {rows.map((r) => {
            const slug = r.answer_key.toLowerCase();
            const lastSeen = r.last_seen
              ? formatPuzzleDateLong(String(r.last_seen).slice(0, 10))
              : null;

            return (
              <li
                key={r.answer_key}
                className="card-lift card-hover-marigold flex items-center justify-between gap-3 p-4"
              >
                <div>
                  <Link
                    href={`/answers/common/${slug}`}
                    className="verba-link font-medium text-slate-900"
                  >
                    {r.answer_key}
                  </Link>

                  <div className="mt-1 text-xs text-slate-500">
                    {r.answer_len} letters · Seen{' '}
                    {r.occurrence_count.toLocaleString()} time
                    {r.occurrence_count === 1 ? '' : 's'}
                    {lastSeen &&
                      r.last_seen_source_slug &&
                      r.last_seen_occurrence_id && (
                        <>
                          {' · '}
                          <Link
                            href={`/answers/${encodeURIComponent(
                              r.last_seen_source_slug,
                            )}/${encodeURIComponent(
                              String(r.last_seen).slice(0, 10),
                            )}#clue-${r.last_seen_occurrence_id}`}
                            scroll={false}
                            className="verba-link text-verba-blue"
                          >
                            Last seen {lastSeen}
                          </Link>
                        </>
                      )}
                  </div>
                </div>

                <Link
                  href={`/answers/common/${slug}`}
                  className="btn-press btn-marigold-hover rounded-lg border px-3 py-1.5 text-sm font-medium"
                >
                  View →
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <nav className="flex items-center justify-between text-sm">
        {hasPrev ? (
          <Link
            href={`/answers/common/length/${length}?page=${page - 1}`}
            className="verba-link text-verba-blue"
          >
            ← Previous
          </Link>
        ) : (
          <span />
        )}

        <span className="text-slate-500">Page {page}</span>

        {hasNext ? (
          <Link
            href={`/answers/common/length/${length}?page=${page + 1}`}
            className="verba-link text-verba-blue"
          >
            Next →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
