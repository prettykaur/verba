// app/answers/[source]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateShort } from '@/lib/formatDate';
import { TrackedLink } from '@/components/TrackedLink';

export const revalidate = 3600;

const SOURCE_NAMES: Record<string, string> = {
  'nyt-mini': 'NYT Mini',
  seed: 'Classic Crossword Clues',
};

const CLASSIC_PAGE_SIZE = 100;
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

/* =====================================
   METADATA
===================================== */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ source: string }>;
  searchParams?: Promise<{ letter?: string }>;
}): Promise<Metadata> {
  const { source } = await params;
  const letter = (await searchParams)?.letter?.toUpperCase();
  const sourceName = SOURCE_NAMES[source] ?? source;

  const isClassic = source === 'seed';

  const title = isClassic
    ? `${sourceName} — Browse Crossword Clues ${letter ? `(${letter})` : 'A–Z'} | Verba`
    : `${sourceName} — Recent Answers | Verba`;

  const description = isClassic
    ? `Browse classic crossword clues ${
        letter ? `starting with "${letter}" ` : ''
      }in alphabetical order. Find verified answers, historical usages, and recurring clue patterns from major crossword publications.`
    : `Recent dates and daily answer pages for ${sourceName}.`;

  const url = `https://tryverba.com/answers/${source}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'Verba', type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/* =====================================
   PAGE
===================================== */
export default async function SourceIndexPage({
  params,
  searchParams,
}: PageProps) {
  const { source } = await params;
  const isClassic = source === 'seed';

  /* ===============================
     CLASSIC CROSSWORD CLUES MODE
     =============================== */
  if (isClassic) {
    const letterParam = (await searchParams)?.letter?.toUpperCase() ?? 'A';
    const currentLetter = LETTERS.includes(letterParam) ? letterParam : 'A';

    const currentPage = Math.max(1, Number((await searchParams)?.page ?? 1));
    const from = (currentPage - 1) * CLASSIC_PAGE_SIZE;
    const to = from + CLASSIC_PAGE_SIZE - 1;

    // Letter filtering
    const letterFilter =
      currentLetter === '#'
        ? (q: any) => q.not('clue_text', 'ilike', '[A-Z]%')
        : (q: any) => q.ilike('clue_text', `${currentLetter}%`);

    const [{ data, error }, { count }] = await Promise.all([
      letterFilter(
        supabase
          .from('v_search_results_pretty')
          .select('occurrence_id, clue_text, source_name')
          .eq('source_slug', source)
          .order('clue_text', { ascending: true })
          .range(from, to),
      ),
      letterFilter(
        supabase
          .from('v_search_results_pretty')
          .select('*', { count: 'exact', head: true })
          .eq('source_slug', source),
      ),
    ]);

    if (error) console.error(error);

    const rows: ClassicRow[] = (data ?? []) as ClassicRow[];
    const sourceName = rows[0]?.source_name ?? SOURCE_NAMES[source] ?? source;

    const totalPages = Math.max(1, Math.ceil((count ?? 0) / CLASSIC_PAGE_SIZE));

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{sourceName}</h1>

        {/* SEO intro copy */}
        <p className="max-w-3xl text-slate-600">
          This archive contains thousands of classic crossword clues that appear
          across puzzles from major publications. Browse clues alphabetically to
          find verified answers, understand historical usage, and recognize
          recurring clue patterns.
        </p>

        <p className="max-w-3xl text-slate-600">
          Select a letter below to explore clues that begin with that letter.
          Pagination allows you to browse deeper into each section.
        </p>

        {/* GLOBAL A–Z NAV */}
        <nav className="sticky top-16 z-10 bg-white px-4 py-2">
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

        {/* CLUES LIST */}
        {rows.length === 0 ? (
          <div className="rounded-lg border bg-white p-4">
            <p>No clues found for this letter.</p>
          </div>
        ) : (
          <ul className="mt-6 space-y-2">
            {rows.map((r) => (
              <li key={r.occurrence_id}>
                <Link
                  href={`/clue/${encodeURIComponent(String(r.occurrence_id))}`}
                  className="verba-link text-verba-blue"
                >
                  {r.clue_text}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* PAGINATION */}
        <nav className="mt-8 flex items-center justify-between text-sm">
          {currentPage > 1 ? (
            <Link
              href={`/answers/${source}?letter=${currentLetter}&page=${
                currentPage - 1
              }`}
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
              href={`/answers/${source}?letter=${currentLetter}&page=${
                currentPage + 1
              }`}
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
      </div>
    );
  }

  /* ===============================
     NORMAL DAILY PUZZLE MODE
     =============================== */
  const { data, error } = await supabase
    .from('v_search_results_pretty')
    .select('puzzle_date, source_name')
    .eq('source_slug', source)
    .order('puzzle_date', { ascending: false })
    .limit(500);

  if (error) console.error(error);

  const sourceName =
    (data?.[0] as { source_name: string | null } | undefined)?.source_name ??
    SOURCE_NAMES[source] ??
    source;

  const dates: string[] = [];
  for (const r of (data ?? []) as { puzzle_date: string | null }[]) {
    if (!r.puzzle_date) continue;
    if (!dates.includes(r.puzzle_date)) dates.push(r.puzzle_date);
    if (dates.length >= 60) break;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{sourceName} — Recent Answers</h1>

      <p className="mt-2 text-slate-600">
        Find recent days for {sourceName}. You can also view{' '}
        <Link
          href={`/answers/${source}/today`}
          className="verba-link text-verba-blue"
        >
          Today
        </Link>
      </p>

      <p className="mt-4 text-slate-600">
        Each {sourceName} daily answer page includes verified clues, solutions,
        and structured data.
      </p>

      {dates.length === 0 ? (
        <div className="mt-6 rounded-lg border bg-white p-4">
          <p>No dates found for this source yet.</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {dates.map((d) => (
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
      )}

      <div className="mt-8">
        <Link href="/answers" className="verba-link text-verba-blue">
          ← Back to all sources
        </Link>
      </div>
    </div>
  );
}
