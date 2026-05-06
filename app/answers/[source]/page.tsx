// app/answers/[source]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateShort } from '@/lib/formatDate';
import { TrackedLink } from '@/components/TrackedLink';
import { notFound } from 'next/navigation';
import { buildBreadcrumb } from '@/lib/schema';
import { getSourceDisplay, resolveSourceName } from '@/lib/sourceDisplay';

export const revalidate = 3600;
const QUERY_TIMEOUT_MS = 4000;

const CLASSIC_PAGE_SIZE = 100;
const MAX_CLASSIC_RESULTS = 5000;
const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

type PageProps = {
  params: Promise<{ source: string }>;
  searchParams?: Promise<{ letter?: string; page?: string }>;
};

type ClassicRow = {
  occurrence_id: number;
  clue_text: string;
  source_name: string | null;
};

function formatMonthYear(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/* ===========================
   METADATA
=========================== */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ source: string }>;
  searchParams?: Promise<{ letter?: string }>;
}): Promise<Metadata> {
  const { source } = await params;
  const letter = (await searchParams)?.letter?.toUpperCase();
  const sourceName = getSourceDisplay(source);

  const isClassic = source === 'seed';

  const title = isClassic
    ? `${sourceName} — Browse Crossword Clues ${letter ? `(${letter})` : 'A–Z'} | Verba`
    : `${sourceName} Crossword Answers | Daily Solutions & Recent Puzzles`;

  const description = isClassic
    ? `Browse classic crossword clues ${
        letter ? `starting with "${letter}" ` : ''
      }in alphabetical order.`
    : `Daily ${sourceName} crossword answers updated every day. Find solutions for recent puzzles by date.`;

  const url = `https://tryverba.com/answers/${source}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'Verba', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/* ===========================
   PAGE
=========================== */
export default async function SourceIndexPage({
  params,
  searchParams,
}: PageProps) {
  const { source } = await params;
  const isClassic = source === 'seed';

  /* ===============================
     CLASSIC MODE
  =============================== */
  if (isClassic) {
    const resolvedSearchParams = await searchParams;
    const letterParam = resolvedSearchParams?.letter?.toUpperCase() ?? 'A';
    const currentLetter = LETTERS.includes(letterParam) ? letterParam : 'A';

    const MAX_PAGE = 50;
    const currentPage = Math.min(
      MAX_PAGE,
      Math.max(1, Number(resolvedSearchParams?.page ?? 1)),
    );

    const from = (currentPage - 1) * CLASSIC_PAGE_SIZE;
    const to = from + CLASSIC_PAGE_SIZE - 1;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);

    let rows: ClassicRow[] = [];
    let count: number | null = null;

    try {
      const baseQuery = supabase
        .from('v_search_results_pretty')
        .select('occurrence_id, clue_text, source_name')
        .eq('source_slug', source)
        .order('clue_text', { ascending: true });

      const countQuery = supabase
        .from('v_search_results_pretty')
        .select('*', { count: 'exact', head: true })
        .eq('source_slug', source);

      const dataQuery =
        currentLetter === '#'
          ? baseQuery.not('clue_text', 'ilike', '[A-Z]%')
          : baseQuery.ilike('clue_text', `${currentLetter}%`);

      const countFilteredQuery =
        currentLetter === '#'
          ? countQuery.not('clue_text', 'ilike', '[A-Z]%')
          : countQuery.ilike('clue_text', `${currentLetter}%`);

      const [dataRes, countRes] = await Promise.all([
        dataQuery.range(from, to).abortSignal(controller.signal),
        countFilteredQuery.abortSignal(controller.signal),
      ]);

      if (dataRes.error) console.error(dataRes.error);
      if (countRes.error) console.error(countRes.error);

      rows = (dataRes.data ?? []) as ClassicRow[];
      count = countRes.count ?? null;
    } catch (err) {
      console.error('Supabase timeout @classic source:', err);
    } finally {
      clearTimeout(timeout);
    }

    const totalPages = Math.min(
      Math.ceil((count ?? 0) / CLASSIC_PAGE_SIZE),
      Math.ceil(MAX_CLASSIC_RESULTS / CLASSIC_PAGE_SIZE),
    );

    if (currentPage > totalPages) notFound();

    const sourceName = resolveSourceName(source, rows[0]?.source_name);

    // Breadcrumb
    const breadcrumb = buildBreadcrumb([
      { name: 'Home', url: 'https://tryverba.com' },
      { name: 'Answers', url: 'https://tryverba.com/answers' },
      { name: sourceName, url: `https://tryverba.com/answers/${source}` },
    ]);

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{sourceName}</h1>

        <p className="max-w-3xl text-slate-600">
          Browse classic crossword clues alphabetically.
        </p>

        <nav className="sticky top-16 z-10 bg-white px-6 py-3">
          <ul className="flex flex-wrap justify-between gap-y-2 text-sm">
            {LETTERS.map((l) => (
              <li key={l}>
                <Link
                  href={`/answers/${source}?letter=${encodeURIComponent(l)}`}
                  className={`verba-link font-semibold ${
                    l === currentLetter ? 'text-slate-900' : 'text-verba-blue'
                  }`}
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="mt-6 space-y-2">
          {rows.map((r) => (
            <li key={r.occurrence_id}>
              <Link
                href={`/clue/${r.occurrence_id}`}
                className="verba-link text-verba-blue"
              >
                {r.clue_text}
              </Link>
            </li>
          ))}
        </ul>

        <nav className="mt-8 flex items-center justify-between text-sm">
          {currentPage > 1 ? (
            <Link
              href={`/answers/${source}?letter=${currentLetter}&page=${currentPage - 1}`}
              className="verba-link text-verba-blue"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}

          <span className="text-slate-500">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`/answers/${source}?letter=${currentLetter}&page=${currentPage + 1}`}
              className="verba-link text-verba-blue"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <div className="mt-8">
          <Link href="/answers" className="verba-link text-verba-blue">
            ← Back to all sources
          </Link>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
        />
      </div>
    );
  }

  /* ===============================
     DAILY MODE
  =============================== */
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number(resolvedSearchParams?.page ?? 1));
  const MONTHS_PER_PAGE = 2;

  const { data: sourceRow, error: sourceError } = await supabase
    .from('puzzle_source')
    .select('id, name, slug')
    .eq('slug', source)
    .maybeSingle();

  if (sourceError) {
    console.error(
      '[SourceIndexPage] source lookup error:',
      JSON.stringify(sourceError, null, 2),
    );
    notFound();
  }

  if (!sourceRow) {
    notFound();
  }

  const { data: puzzleDaysData, error: puzzleDaysError } = await supabase
    .from('puzzle_day')
    .select('puzzle_date')
    .eq('source_id', sourceRow.id)
    .order('puzzle_date', { ascending: false });

  if (puzzleDaysError) {
    console.error(
      '[SourceIndexPage] puzzle_day error:',
      JSON.stringify(puzzleDaysError, null, 2),
    );
    notFound();
  }

  const data = (puzzleDaysData ?? []).map((r) => ({
    puzzle_date: r.puzzle_date,
    source_name: sourceRow.name,
  }));

  const sourceName = resolveSourceName(source, data[0]?.source_name);

  // 1. Deduplicate dates
  const dates = Array.from(
    new Set(data.map((r) => r.puzzle_date).filter(Boolean)),
  ) as string[];

  // 2. Group by YYYY-MM
  const groupedByMonth: Record<string, string[]> = {};

  for (const d of dates) {
    const monthKey = d.slice(0, 7); // YYYY-MM
    groupedByMonth[monthKey] ||= [];
    groupedByMonth[monthKey].push(d);
  }

  // 2b. Sort dates within each month (newest → oldest)
  for (const monthKey of Object.keys(groupedByMonth)) {
    groupedByMonth[monthKey].sort((a, b) => b.localeCompare(a));
  }

  // 3. Sort months newest → oldest
  const months = Object.keys(groupedByMonth).sort().reverse();

  // 4. Paginate months
  const start = (page - 1) * MONTHS_PER_PAGE;
  const end = start + MONTHS_PER_PAGE;
  const visibleMonths = months.slice(start, end);

  // 5. Pagination guards
  const totalPages = Math.max(1, Math.ceil(months.length / MONTHS_PER_PAGE));

  if (page > totalPages) {
    notFound();
  }

  const hasOlder = page < totalPages;

  const isFirstPage = page === 1;

  const faqItems = [
    {
      q: `What is the ${sourceName}?`,
      a: `The ${sourceName} is a daily mini crossword puzzle designed for quick completion, featuring a compact grid and straightforward clues.`,
    },
    {
      q: `How often is the ${sourceName} published?`,
      a: `The ${sourceName} is published every day, with a new puzzle released daily.`,
    },
    {
      q: `Where can I find ${sourceName} crossword answers?`,
      a: `You can find daily ${sourceName} crossword answers on this page, organized by date for easy browsing.`,
    },
  ];

  // Breadcrumb
  const breadcrumb = buildBreadcrumb([
    { name: 'Home', url: 'https://tryverba.com' },
    { name: 'Answers', url: 'https://tryverba.com/answers' },
    {
      name: sourceName,
      url: `https://tryverba.com/answers/${source}`,
    },
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{sourceName} Crossword Answers</h1>
      <section className="max-w-3xl space-y-3 text-slate-600">
        <p>
          The {sourceName} is a short-form daily crossword puzzle designed for
          quick, satisfying solves. New puzzles are released every day.
        </p>
        <p>
          On this page, you’ll find daily {sourceName} crossword answers,
          organized by date so you can quickly find solutions for recent
          puzzles.
        </p>
      </section>

      <div className="mt-4">
        <Link
          href={`/answers/${source}/archive`}
          className="verba-link font-medium text-verba-blue"
        >
          Explore the full {sourceName} crossword archive →
        </Link>
      </div>

      <section className="rounded-xl border bg-slate-50 p-4 text-sm">
        <h2 className="font-semibold">Most Common Answers</h2>
        <p className="mt-1 text-slate-700">
          Curious which answers appear most often in crosswords?
        </p>

        <ul className="mt-2 space-y-1">
          <li>
            <Link href="/answers/common" className="verba-link text-verba-blue">
              View most common crossword answers →
            </Link>
          </li>

          <li>
            <Link
              href="/answers/common/length/3-letter"
              className="verba-link text-verba-blue"
            >
              Most common 3-letter answers →
            </Link>
          </li>
        </ul>
      </section>
      <div className="mt-6 space-y-8">
        {visibleMonths.map((monthKey) => {
          const monthDates = groupedByMonth[monthKey];

          return (
            <section key={monthKey}>
              <h2 className="mb-3 text-lg font-semibold">
                {formatMonthYear(`${monthKey}-01`)}
              </h2>

              <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {monthDates.map((d) => (
                  <li key={d}>
                    <TrackedLink
                      href={`/answers/${source}/${d}`}
                      className="btn-marigold-hover btn-press block rounded-lg border bg-white px-3 py-2 text-center text-sm"
                      event="click_source_date"
                      props={{ source, date: d, from: 'source_index' }}
                    >
                      {formatPuzzleDateShort(d)}
                    </TrackedLink>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <nav className="mt-8 flex justify-between text-sm">
        {page > 1 ? (
          <Link
            href={`/answers/${source}?page=${page - 1}`}
            className="verba-link text-verba-blue"
          >
            ← Newer puzzles
          </Link>
        ) : (
          <span />
        )}

        {!isFirstPage ? (
          <Link
            href={`/answers/${source}`}
            className="verba-link text-verba-blue"
          >
            Back to latest
          </Link>
        ) : (
          <span />
        )}

        {hasOlder ? (
          <Link
            href={`/answers/${source}?page=${page + 1}`}
            className="verba-link text-verba-blue"
          >
            Older puzzles →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <div className="mt-8 text-sm">
        <Link href="/answers" className="verba-link text-verba-blue">
          ← Back to all sources
        </Link>
      </div>
      <section className="mt-12 max-w-3xl">
        <h2 className="mb-4 text-lg font-semibold">
          Frequently Asked Questions
        </h2>
        <ul className="space-y-4 text-slate-600">
          {faqItems.map((f) => (
            <li key={f.q}>
              <p className="font-medium text-slate-900">{f.q}</p>
              <p>{f.a}</p>
            </li>
          ))}
        </ul>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: a,
              },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </div>
  );
}
