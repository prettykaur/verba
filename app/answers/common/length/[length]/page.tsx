// app/answers/common/length/[length]/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { getCommonAnswers, PAGE_SIZE } from '@/lib/getCommonAnswers';

export const revalidate = 3600;

const BASE_URL = 'https://tryverba.com';

type PageProps = {
  params: Promise<{ length: string }>;
  searchParams?: Promise<{ page?: string }>;
};

function parseLengthParam(param: string) {
  if (param === '8-plus') {
    return { type: 'gte' as const, value: 8 };
  }

  const match = param.match(/^(\d+)-letter$/);
  if (!match) return null;

  return { type: 'eq' as const, value: Number(match[1]) };
}

/* =========================
   Metadata
========================= */

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
  };
}

/* =========================
   Page
========================= */

export default async function CommonAnswersByLength({
  params,
  searchParams,
}: PageProps) {
  const { length } = await params;
  const parsed = parseLengthParam(length);
  if (!parsed) notFound();

  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page ?? 1));

  const { rows, total } = await getCommonAnswers({
    length: parsed,
    page,
  });

  if (!total || total < 1) {
    notFound();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (page > totalPages) {
    notFound();
  }

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = total ? Math.min(page * PAGE_SIZE, total) : null;

  const lengthLabel =
    parsed.type === 'eq' ? `${parsed.value}-letter` : `${parsed.value}+ letter`;

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

      {/* RESULT COUNT */}
      {total && total > 0 && (
        <div className="text-sm text-slate-600">
          Showing <strong>{from}</strong> to <strong>{to}</strong> of{' '}
          <strong>{total.toLocaleString()}</strong> answers
        </div>
      )}

      {/* RESULTS */}
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
                    {lastSeen && ` · Last seen ${lastSeen}`}
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
