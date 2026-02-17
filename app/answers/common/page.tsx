// app/answers/common/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { permanentRedirect } from 'next/navigation';

export const revalidate = 3600;

type StatsRow = {
  answer_key: string;
  answer_len: number;
  occurrence_count: number;
  last_seen: string | null;
  last_seen_source_slug: string | null;
  last_seen_occurrence_id: number | null;
};

type PageProps = {
  searchParams?: Promise<{ page?: string; starts?: string }>;
};

const BASE_URL = 'https://tryverba.com';
const PAGE_SIZE = 100;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; starts?: string }>;
}): Promise<Metadata> {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page ?? 1));
  const starts = sp.starts?.toUpperCase();

  let canonical = `${BASE_URL}/answers/common`;

  if (starts) {
    canonical += `?starts=${encodeURIComponent(starts)}`;
  }

  if (page > 1) {
    canonical += starts ? `&page=${page}` : `?page=${page}`;
  }

  const title = starts
    ? `Common Crossword Answers Starting With "${starts}" | Verba`
    : `Most Common Crossword Answers | Verba`;

  const description = starts
    ? `Browse the most common crossword answers starting with the letter "${starts}".`
    : `Browse the most common crossword answers by frequency and last seen date.`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: page === 1,
      follow: true,
    },
  };
}

function toLowerAnswerSlug(answerKey: string) {
  return answerKey.toLowerCase();
}

export default async function CommonAnswersHub({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page ?? 1));
  const starts = sp.starts?.toUpperCase();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('v_answer_stats')
    .select(
      'answer_key, answer_len, occurrence_count, last_seen, last_seen_source_slug, last_seen_occurrence_id',
      { count: 'exact' },
    )
    .order('occurrence_count', { ascending: false })
    .order('last_seen', { ascending: false });

  if (starts && /^[A-Z]$/.test(starts)) {
    permanentRedirect(`/answers/common/starts/${starts}`);
  }

  const { data, count } = await query.range(from, to);

  const rows = (data ?? []) as StatsRow[];
  const total = typeof count === 'number' ? count : null;
  const totalPages = total ? Math.ceil(total / PAGE_SIZE) : null;

  if (totalPages && page > totalPages) notFound();

  const lengths = [3, 4, 5, 6, 7];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="text-xs text-slate-500">
        <Link href="/" className="verba-link text-verba-blue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/answers" className="verba-link text-verba-blue">
          Answers
        </Link>
        <span className="mx-2">/</span>
        <span>Common Answers</span>
      </nav>

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">
          {starts
            ? `Common Crossword Answers Starting With "${starts}"`
            : `Most Common Crossword Answers`}
        </h1>
        <p className="max-w-3xl text-slate-600">
          Some crossword answers appear far more frequently than others. These
          entries are often short, vowel-heavy words that help constructors fill
          grids smoothly.
        </p>
        <div className="pt-4 text-sm text-slate-600">
          Browse by:{' '}
          <Link href="/answers/common" className="verba-link text-verba-blue">
            All
          </Link>
          {' · '}
          <Link
            href="/answers/common/starts/A"
            className="verba-link text-verba-blue"
          >
            Letter
          </Link>
          {' · '}
          <Link
            href="/answers/common/length/3-letter"
            className="verba-link text-verba-blue"
          >
            Length
          </Link>
        </div>
      </header>

      {starts && (
        <div className="text-sm text-slate-600">
          Filtering by letter: <strong>{starts}</strong>{' '}
          <Link href="/answers/common" className="verba-link text-verba-blue">
            Clear filter →
          </Link>
        </div>
      )}

      {/* Length Filters */}
      <section className="flex flex-wrap gap-2">
        <Link
          href="/answers/common"
          className="btn-press btn-marigold-hover rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900"
        >
          All
        </Link>

        {lengths.map((n) => (
          <Link
            key={n}
            href={`/answers/common/length/${n}-letter`}
            className="btn-press btn-marigold-hover rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-verba-blue"
          >
            {n}-letter
          </Link>
        ))}

        <Link
          href="/answers/common/length/8-plus"
          className="btn-press btn-marigold-hover rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-verba-blue"
        >
          8+ letters
        </Link>
      </section>

      {/* Result Count */}
      {total !== null && (
        <div className="text-sm text-slate-600">
          Showing <strong className="text-slate-900">{from + 1}</strong> to{' '}
          <strong className="text-slate-900">
            {Math.min(from + PAGE_SIZE, total)}
          </strong>{' '}
          of <strong className="text-slate-900">{total}</strong> answers
        </div>
      )}

      {/* Results */}
      <section className="rounded-xl border bg-white">
        <ul className="divide-y">
          {rows.map((r) => {
            const slug = toLowerAnswerSlug(r.answer_key);
            const lastSeen = r.last_seen
              ? formatPuzzleDateLong(String(r.last_seen).slice(0, 10))
              : null;

            return (
              <li
                key={`${r.answer_key}-${r.answer_len}`}
                className="card-lift card-hover-marigold flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/answers/common/${encodeURIComponent(slug)}`}
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
                  href={`/answers/common/${encodeURIComponent(slug)}`}
                  className="btn-press btn-marigold-hover rounded-lg border px-3 py-1.5 text-sm font-medium"
                >
                  View →
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Pagination Controls */}
      {totalPages && totalPages > 1 && (
        <nav className="flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link
              href={
                page === 2
                  ? `/answers/common`
                  : `/answers/common?page=${page - 1}`
              }
              className="verba-link text-verba-blue"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}

          <span className="text-slate-500">
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={`/answers/common?page=${page + 1}`}
              className="verba-link text-verba-blue"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
