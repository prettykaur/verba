// app/answers/common/length/[length]/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';

export const revalidate = 3600;

const PAGE_SIZE = 100;

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
}: {
  params: Promise<{ length: string }>;
}): Promise<Metadata> {
  const { length } = await params;
  const parsed = parseLengthParam(length);

  if (!parsed) {
    return { title: 'Common Crossword Answers | Verba' };
  }

  const label =
    parsed.type === 'eq' ? `${parsed.value}-Letter` : `${parsed.value}+ Letter`;

  return {
    title: `Most Common ${label} Crossword Answers | Verba`,
    description: `Browse the most common ${label.toLowerCase()} crossword answers.`,
  };
}

export default async function CommonAnswersByLength({
  params,
  searchParams,
}: {
  params: Promise<{ length: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
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
      'answer_key, answer_len, occurrence_count, last_seen, last_seen_source_slug',
      { count: 'exact' },
    )
    .order('occurrence_count', { ascending: false });

  if (parsed.type === 'eq') {
    query = query.eq('answer_len', parsed.value);
  } else {
    query = query.gte('answer_len', parsed.value);
  }

  const { data, count } = await query.range(from, to);

  const rows = data ?? [];
  const total = typeof count === 'number' ? count : null;
  const totalPages = total ? Math.ceil(total / PAGE_SIZE) : null;

  if (totalPages && page > totalPages) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/answers/common"
        className="verba-link text-sm text-verba-blue"
      >
        ← Back to All Common Answers
      </Link>

      <h1 className="text-2xl font-bold">
        Most Common{' '}
        {parsed.type === 'eq'
          ? `${parsed.value}-Letter`
          : `${parsed.value}+ Letter`}{' '}
        Crossword Answers
      </h1>

      <p className="max-w-3xl text-slate-600">
        These are the most frequently used{' '}
        {parsed.type === 'eq'
          ? `${parsed.value}-letter`
          : `${parsed.value}+ letter`}{' '}
        crossword answers across major puzzle sources. Short, versatile entries
        like these help constructors balance crossword grids.
      </p>

      <hr className="border-slate-200" />

      {total !== null && (
        <div className="text-sm text-slate-600">
          Showing <strong className="text-slate-900">{from + 1}</strong> to{' '}
          <strong className="text-slate-900">
            {Math.min(from + PAGE_SIZE, total)}
          </strong>{' '}
          of <strong className="text-slate-900">{total}</strong>{' '}
          {parsed.type === 'eq'
            ? `${parsed.value}-letter answers`
            : `${parsed.value}+ letter answers`}
        </div>
      )}

      <section className="rounded-xl border bg-white">
        <ul className="divide-y">
          {rows.map((r: any) => {
            const slug = r.answer_key.toLowerCase();
            const lastSeen = r.last_seen
              ? formatPuzzleDateLong(String(r.last_seen).slice(0, 10))
              : null;

            return (
              <li
                key={r.answer_key}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div>
                  <Link
                    href={`/answers/common/${slug}`}
                    className="verba-link font-medium text-slate-900"
                  >
                    {r.answer_key}
                  </Link>

                  <div className="mt-1 text-xs text-slate-500">
                    {r.answer_len} letters · Seen {r.occurrence_count} times
                    {lastSeen && r.last_seen_source_slug && (
                      <>
                        {' · '}
                        <Link
                          href={`/answers/${r.last_seen_source_slug}/${String(
                            r.last_seen,
                          ).slice(0, 10)}`}
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

      {totalPages && totalPages > 1 && (
        <nav className="flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link
              href={`/answers/common/length/${length}?page=${page - 1}`}
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
              href={`/answers/common/length/${length}?page=${page + 1}`}
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
