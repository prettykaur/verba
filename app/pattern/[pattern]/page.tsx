// app/pattern/[pattern]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const revalidate = 86400;

type Props = {
  params: Promise<{ pattern: string }>;
  searchParams?: Promise<{ page?: string }>;
};

const PAGE_SIZE = 100;

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

  const sqlPattern = rawPattern.replaceAll('*', '%').replaceAll('?', '_');

  const { data, count, error } = await supabase
    .from('v_answer_stats')
    .select('answer_key, answer_len, occurrence_count, last_seen', {
      count: 'exact',
    })
    .like('answer_key', sqlPattern)
    .order('occurrence_count', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('[pattern page] error:', JSON.stringify(error, null, 2));
    notFound();
  }

  const results = data ?? [];
  const total = typeof count === 'number' ? count : null;

  const hasNext = total !== null && to + 1 < total;
  const hasPrev = page > 1;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">
        Words matching pattern: {rawPattern}
      </h1>

      <p className="mb-6 text-sm text-gray-600">
        Crossword answers matching <strong>{rawPattern}</strong>. Results ranked
        by frequency.
      </p>

      {results.length === 0 && (
        <p className="text-gray-500">No matches found.</p>
      )}

      <ul className="space-y-3">
        {results.map((row) => (
          <li
            key={row.answer_key}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <div className="text-lg font-medium">{row.answer_key}</div>
              <div className="text-sm text-gray-500">
                {row.answer_len} letters • seen {row.occurrence_count} times
              </div>
            </div>

            <Link
              href={`/answers/common/${row.answer_key.toLowerCase()}`}
              className="text-sm text-blue-600"
            >
              View →
            </Link>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="mt-8 flex justify-between text-sm">
        {hasPrev ? (
          <Link href={`/pattern/${rawPattern}?page=${page - 1}`}>
            ← Previous
          </Link>
        ) : (
          <span />
        )}

        {hasNext ? (
          <Link href={`/pattern/${rawPattern}?page=${page + 1}`}>Next →</Link>
        ) : (
          <span />
        )}
      </div>
    </main>
  );
}
