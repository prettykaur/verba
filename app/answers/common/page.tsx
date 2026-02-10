// app/answers/common/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';

export const revalidate = 3600;

type StatsRow = {
  answer_key: string;
  answer_len: number;
  occurrence_count: number;
  last_seen: string | null;
  last_seen_source_slug: string | null;
};

type PageProps = {
  searchParams?: Promise<{ len?: string; page?: string }>;
};

const BASE_URL = 'https://tryverba.com';
const PAGE_SIZE = 100;

function toLowerAnswerSlug(answerKey: string) {
  return answerKey.toLowerCase();
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = (await searchParams) ?? {};
  const len = sp.len ? Number(sp.len) : null;

  const title = len
    ? `Most Common ${len}-Letter Crossword Answers | Verba`
    : 'Most Common Crossword Answers | Verba';

  const description = len
    ? `Browse the most common ${len}-letter crossword answers by frequency and last seen date.`
    : 'Browse the most common crossword answers by frequency and last seen date.';

  const canonical = len
    ? `${BASE_URL}/answers/common?len=${encodeURIComponent(String(len))}`
    : `${BASE_URL}/answers/common`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Verba',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function CommonAnswersHub({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const len = sp.len ? Number(sp.len) : null;
  const page = Math.max(1, Number(sp.page ?? 1));

  if (len !== null && (!Number.isFinite(len) || len < 2 || len > 30)) {
    notFound();
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('v_answer_stats')
    .select(
      'answer_key, answer_len, occurrence_count, last_seen, last_seen_source_slug',
      {
        count: 'exact',
      },
    )
    .order('occurrence_count', { ascending: false })
    .order('last_seen', { ascending: false });

  if (len !== null) query = query.eq('answer_len', len);

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error('Supabase @common answers hub:', error);
  }

  const rows = (data ?? []) as StatsRow[];
  const total = typeof count === 'number' ? count : null;
  const totalPages = total ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : null;

  if (totalPages && page > totalPages) notFound();

  const lengths = [3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-6">
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

      <header className="space-y-2">
        <h1 className="text-2xl font-bold">
          {len
            ? `Most Common ${len}-Letter Crossword Answers`
            : 'Most Common Crossword Answers'}
        </h1>
        <p className="max-w-3xl text-slate-600">
          Browse frequently used crossword answers. Click an answer to see when
          it last appeared and where it shows up.
        </p>
      </header>

      {/* Length filters */}
      <section className="flex flex-wrap gap-2">
        <Link
          href="/answers/common"
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            len === null
              ? 'border-slate-300 bg-slate-50 text-slate-900'
              : 'border-slate-200 text-verba-blue'
          }`}
        >
          All
        </Link>

        {lengths.map((n) => (
          <Link
            key={n}
            href={`/answers/common?len=${n}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              len === n
                ? 'border-slate-300 bg-slate-50 text-slate-900'
                : 'border-slate-200 text-verba-blue'
            }`}
          >
            {n}-letter
          </Link>
        ))}
      </section>

      {/* Results */}
      <section className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <p className="text-sm text-slate-600">
            {total !== null ? (
              <>
                Showing <strong className="text-slate-900">{from + 1}</strong>{' '}
                to{' '}
                <strong className="text-slate-900">
                  {Math.min(from + PAGE_SIZE, total)}
                </strong>{' '}
                of <strong className="text-slate-900">{total}</strong>
              </>
            ) : (
              'Showing results'
            )}
          </p>
        </div>

        <ul className="divide-y">
          {rows.map((r) => {
            const slug = toLowerAnswerSlug(r.answer_key);
            const lastSeen = r.last_seen
              ? formatPuzzleDateLong(String(r.last_seen).slice(0, 10))
              : null;

            return (
              <li
                key={`${r.answer_key}-${r.answer_len}`}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/answers/common/${encodeURIComponent(slug)}`}
                    className="verba-link text-[0.98rem] font-medium leading-snug text-slate-900"
                  >
                    {r.answer_key}
                  </Link>
                  <div className="mt-1 text-xs text-slate-500">
                    {r.answer_len} letters · Seen{' '}
                    {r.occurrence_count.toLocaleString()} time
                    {r.occurrence_count === 1 ? '' : 's'}
                    {r.last_seen && r.last_seen_source_slug ? (
                      <>
                        {' · '}
                        <Link
                          href={`/answers/${encodeURIComponent(
                            r.last_seen_source_slug,
                          )}/${encodeURIComponent(String(r.last_seen).slice(0, 10))}`}
                          className="verba-link text-verba-blue"
                        >
                          Last seen {lastSeen}
                        </Link>
                      </>
                    ) : null}
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

          {rows.length === 0 && (
            <li className="p-6 text-sm text-slate-600">
              No results found{len ? ` for ${len}-letter answers.` : '.'}
            </li>
          )}
        </ul>
      </section>

      {/* Pagination */}
      <nav className="flex items-center justify-between text-sm">
        {page > 1 ? (
          <Link
            href={
              len !== null
                ? `/answers/common?len=${len}&page=${page - 1}`
                : `/answers/common?page=${page - 1}`
            }
            className="verba-link text-verba-blue"
          >
            ← Previous
          </Link>
        ) : (
          <span />
        )}

        {totalPages ? (
          <span className="text-slate-500">
            Page {page} of {totalPages}
          </span>
        ) : (
          <span />
        )}

        {totalPages && page < totalPages ? (
          <Link
            href={
              len !== null
                ? `/answers/common?len=${len}&page=${page + 1}`
                : `/answers/common?page=${page + 1}`
            }
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
