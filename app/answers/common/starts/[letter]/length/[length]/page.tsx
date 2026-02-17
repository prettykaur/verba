// app/answers/common/starts/[letter]/length/[length]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { getCommonAnswers, PAGE_SIZE } from '@/lib/getCommonAnswers';
import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ letter: string; length: string }>;
  searchParams?: Promise<{ page?: string }>;
};

/* ===========================
   Helpers
=========================== */

function parseLengthParam(param: string) {
  if (param === '8-plus') {
    return { type: 'gte' as const, value: 8 };
  }

  const match = param.match(/^(\d+)-letter$/);
  if (!match) return null;

  return { type: 'eq' as const, value: Number(match[1]) };
}

/* ===========================
   Metadata
=========================== */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { letter, length } = await params;

  const L = letter.toUpperCase();

  if (!/^[A-Z]$/.test(L)) {
    return { title: 'Common Crossword Answers | Verba' };
  }

  const parsed = parseLengthParam(length);
  if (!parsed) {
    return { title: 'Common Crossword Answers | Verba' };
  }

  const lengthLabel =
    parsed.type === 'eq' ? `${parsed.value}-Letter` : `${parsed.value}+ Letter`;

  return {
    title: `Common ${lengthLabel} Crossword Answers Starting With "${L}" | Verba`,
    description: `Browse ${lengthLabel.toLowerCase()} crossword answers that begin with "${L}".`,
    alternates: {
      canonical: `https://tryverba.com/answers/common/starts/${L}/length/${length}`,
    },
  };
}

/* ===========================
   Page
=========================== */

export default async function CommonByLetterAndLengthPage({
  params,
  searchParams,
}: PageProps) {
  const { letter, length } = await params;

  if (letter !== letter.toUpperCase()) {
    redirect(`/answers/common/starts/${letter.toUpperCase()}/length/${length}`);
  }

  const L = letter.toUpperCase();
  if (!/^[A-Z]$/.test(L)) notFound();

  const parsed = parseLengthParam(length);
  if (!parsed) notFound();

  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page ?? 1));

  const { rows, total } = await getCommonAnswers({
    letter: L,
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
        href={`/answers/common/starts/${L}`}
        className="verba-link text-sm text-verba-blue"
      >
        ← Back to "{L}" answers
      </Link>

      <h1 className="text-2xl font-bold">
        Common {lengthLabel} Crossword Answers Starting With "{L}"
      </h1>

      <p className="text-slate-600">
        These {lengthLabel} crossword answers begin with "{L}" and are ordered
        by frequency of appearance.
      </p>

      <div className="pt-4 text-sm text-slate-600">
        Broaden:{' '}
        <Link
          href={`/answers/common/starts/${L}`}
          className="verba-link text-verba-blue"
        >
          All "{L}" answers
        </Link>
        {' · '}
        <Link
          href={`/answers/common/length/${length}`}
          className="verba-link text-verba-blue"
        >
          All {lengthLabel}
        </Link>
        {' · '}
        <Link href="/answers/common" className="verba-link text-verba-blue">
          All Answers
        </Link>
      </div>

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

      {/* PAGINATION */}
      {totalPages && totalPages > 1 && (
        <nav className="flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link
              href={`/answers/common/starts/${L}/length/${length}?page=${page - 1}`}
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
              href={`/answers/common/starts/${L}/length/${length}?page=${page + 1}`}
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
