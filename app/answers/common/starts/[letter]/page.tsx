// app/answers/common/starts/[letter]/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { getCommonAnswers, PAGE_SIZE } from '@/lib/getCommonAnswers';
import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ letter: string }>;
  searchParams?: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { letter } = await params;

  const L = letter.toUpperCase();

  if (!/^[A-Z]$/.test(L)) {
    return { title: 'Common Crossword Answers | Verba' };
  }

  return {
    title: `Common Crossword Answers Starting With "${L}" | Verba`,
    description: `Browse common crossword answers that start with "${L}".`,
    alternates: {
      canonical: `https://tryverba.com/answers/common/starts/${L}`,
    },
  };
}

export default async function CommonByLetterPage({
  params,
  searchParams,
}: PageProps) {
  const { letter } = await params;

  if (letter !== letter.toUpperCase()) {
    redirect(`/answers/common/starts/${letter.toUpperCase()}`);
  }

  const L = letter.toUpperCase();

  if (!/^[A-Z]$/.test(L)) notFound();

  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page ?? 1));

  const { rows, total } = await getCommonAnswers({
    letter: L,
    page,
  });

  const totalPages = total ? Math.ceil(total / PAGE_SIZE) : null;
  if (totalPages && page > totalPages) notFound();

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = total ? Math.min(page * PAGE_SIZE, total) : null;

  const lengths = [3, 4, 5, 6, 7];

  return (
    <div className="space-y-6">
      <Link href="/answers/common" className="verba-link text-verba-blue">
        ← Back to Common Answers
      </Link>
      <h1 className="text-2xl font-bold">
        Common Crossword Answers Starting With "{L}"
      </h1>
      <p className="text-slate-600">
        These crossword answers begin with the letter "{L}" and are ordered by
        frequency.
      </p>

      <div className="pt-4 text-sm text-slate-600">
        Refine:{' '}
        <Link href="/answers/common" className="verba-link text-verba-blue">
          All Answers
        </Link>
        {lengths.map((n) => (
          <span key={n}>
            {' · '}
            <Link
              href={`/answers/common/starts/${L}/length/${n}-letter`}
              className="verba-link text-verba-blue"
            >
              {n}-letter
            </Link>
          </span>
        ))}
        {' · '}
        <Link
          href={`/answers/common/starts/${L}/length/8-plus`}
          className="verba-link text-verba-blue"
        >
          8+ letters
        </Link>
      </div>
      {total !== null && (
        <div className="text-sm text-slate-600">
          Showing <strong>{from}</strong> to <strong>{to}</strong> of{' '}
          <strong>{total}</strong> answers
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
                className="flex items-center justify-between p-4"
              >
                <div>
                  <Link
                    href={`/answers/common/${slug}`}
                    className="verba-link font-medium"
                  >
                    {r.answer_key}
                  </Link>

                  <div className="text-xs text-slate-500">
                    {r.answer_len} letters · Seen{' '}
                    {r.occurrence_count.toLocaleString()} time
                    {r.occurrence_count === 1 ? '' : 's'}
                    {lastSeen && ` · Last seen ${lastSeen}`}
                  </div>
                </div>

                <Link
                  href={`/answers/common/${slug}`}
                  className="btn-press btn-marigold-hover rounded-lg border px-3 py-1.5 text-sm"
                >
                  View →
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      {totalPages && totalPages > 1 && (
        <nav className="flex justify-between text-sm">
          {page > 1 ? (
            <Link
              href={`/answers/common/starts/${L}?page=${page - 1}`}
              className="verba-link text-verba-blue"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}

          <span>
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={`/answers/common/starts/${L}?page=${page + 1}`}
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
