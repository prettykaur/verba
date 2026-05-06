// app/pattern/[pattern]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

export const revalidate = 86400;

const BASE_URL = 'https://tryverba.com';
const PAGE_SIZE = 100;

type Props = {
  params: Promise<{ pattern: string }>;
  searchParams?: Promise<{ page?: string }>;
};

/* =========================
   Metadata
========================= */

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { pattern } = await params;
  const sp = (await searchParams) ?? {};

  const rawPattern = decodeURIComponent(pattern).toUpperCase();
  const page = Math.max(1, Number(sp.page ?? 1));

  const canonical =
    page === 1
      ? `${BASE_URL}/pattern/${pattern}`
      : `${BASE_URL}/pattern/${pattern}?page=${page}`;

  return {
    title: `Crossword answers for pattern ${rawPattern} | Verba`,
    description: `Find crossword answers that match the pattern ${rawPattern}. Browse matching words sorted by frequency.`,
    alternates: { canonical },
    robots: {
      index: page === 1,
      follow: true,
    },
  };
}

/* =========================
   Page
========================= */

export default async function PatternPage({ params, searchParams }: Props) {
  const { pattern } = await params;
  const resolvedSearchParams = await searchParams;

  const rawPattern = decodeURIComponent(pattern).toUpperCase();

  if (!/^[A-Z_*?]+$/.test(rawPattern)) {
    notFound();
  }

  const page = Math.max(1, Number(resolvedSearchParams?.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Extract first fixed letter
  const firstLetterMatch = rawPattern.match(/^[A-Z]/);
  const firstLetter = firstLetterMatch ? firstLetterMatch[0] : null;

  // If no prefix, pattern is too broad
  if (!firstLetter) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <nav className="text-xs text-slate-500">
          <Link href="/" className="verba-link text-verba-blue">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>{rawPattern}</span>
        </nav>

        <h1 className="text-2xl font-bold">
          Crossword answers for pattern {rawPattern}
        </h1>

        <p className="text-slate-600">
          This pattern is too broad and would return too many results. Try a
          more specific pattern that starts with a letter.
        </p>
      </main>
    );
  }

  // Convert pattern
  const sqlPattern = rawPattern.replaceAll('*', '%').replaceAll('?', '_');

  let query = supabase
    .from('v_answer_stats')
    .select('answer_key, answer_len, occurrence_count, last_seen')
    .order('occurrence_count', { ascending: false });

  // Prefix filler
  if (firstLetter) {
    query = query.ilike('answer_key', `${firstLetter}%`);
  }

  // Apply pattern after narrowing dataset
  query = query.like('answer_key', sqlPattern).range(from, to + 1);

  const { data, error } = await query;

  if (error) {
    console.error('[pattern page] error:', JSON.stringify(error, null, 2));
    notFound();
  }

  const rows = data ?? [];
  const hasNext = rows.length > PAGE_SIZE;
  const results = rows.slice(0, PAGE_SIZE);
  const hasPrev = page > 1;

  return (
    <main className="space-y-6">
      {/* BREADCRUMBS */}
      <nav className="text-xs text-slate-500">
        <Link href="/" className="verba-link text-verba-blue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>{rawPattern}</span>
      </nav>

      {/* HEADER */}
      <h1 className="text-2xl font-bold">
        Crossword answers for pattern {rawPattern}
      </h1>

      <p className="text-slate-600">
        Here are crossword answers that match the pattern{' '}
        <strong>{rawPattern}</strong>. Results are sorted by how often they
        appear in puzzles.
      </p>

      {/* RESULTS COUNT */}
      <p className="text-sm text-slate-600">
        Showing <strong>{results.length}</strong> matching answers
      </p>

      {/* RESULTS */}
      <section className="rounded-xl border bg-white">
        <ul className="divide-y">
          {results.map((row) => {
            const slug = row.answer_key.toLowerCase();

            return (
              <li
                key={row.answer_key}
                className="card-lift card-hover-marigold flex items-center justify-between gap-3 p-4"
              >
                <div>
                  <Link
                    href={`/answers/common/${slug}`}
                    className="verba-link font-medium text-slate-900"
                  >
                    {row.answer_key}
                  </Link>

                  <div className="mt-1 text-xs text-slate-500">
                    {row.answer_len} letters · Seen{' '}
                    {row.occurrence_count.toLocaleString()} time
                    {row.occurrence_count === 1 ? '' : 's'}
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

      {/* PAGINATION */}
      <nav className="flex items-center justify-between text-sm">
        {hasPrev ? (
          <Link
            href={`/pattern/${rawPattern}?page=${page - 1}`}
            className="verba-link text-verba-blue"
          >
            ← Previous
          </Link>
        ) : (
          <span />
        )}

        {hasNext ? (
          <Link
            href={`/pattern/${rawPattern}?page=${page + 1}`}
            className="verba-link text-verba-blue"
          >
            Next →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
