// app/answers/[source]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateShort } from '@/lib/formatDate';
import { TrackedLink } from '@/components/TrackedLink';
import { notFound } from 'next/navigation';

export const revalidate = 3600;
const QUERY_TIMEOUT_MS = 4000;

const SOURCE_NAMES: Record<string, string> = {
  'nyt-mini': 'NYT Mini',
  seed: 'Classic Crossword Clues',
};

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
  const sourceName = SOURCE_NAMES[source] ?? source;

  const isClassic = source === 'seed';

  const title = isClassic
    ? `${sourceName} — Browse Crossword Clues ${letter ? `(${letter})` : 'A–Z'} | Verba`
    : `${sourceName} — Recent Answers | Verba`;

  const description = isClassic
    ? `Browse classic crossword clues ${
        letter ? `starting with "${letter}" ` : ''
      }in alphabetical order.`
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

    const sourceName = rows[0]?.source_name ?? SOURCE_NAMES[source] ?? source;

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
      </div>
    );
  }

  /* ===============================
     DAILY MODE
  =============================== */
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);

  let data: { puzzle_date: string | null; source_name: string | null }[] = [];

  try {
    const res = await supabase
      .from('v_search_results_pretty')
      .select('puzzle_date, source_name')
      .eq('source_slug', source)
      .order('puzzle_date', { ascending: false })
      .limit(500)
      .abortSignal(controller.signal);

    if (res.error) console.error(res.error);
    data = res.data ?? [];
  } catch (err) {
    console.error('Supabase timeout @daily source:', err);
  } finally {
    clearTimeout(timeout);
  }

  const sourceName = data[0]?.source_name ?? SOURCE_NAMES[source] ?? source;

  const dates: string[] = [];
  for (const r of data) {
    if (!r.puzzle_date) continue;
    if (!dates.includes(r.puzzle_date)) dates.push(r.puzzle_date);
    if (dates.length >= 60) break;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{sourceName} — Recent Answers</h1>

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

      <div className="mt-8">
        <Link href="/answers" className="verba-link text-verba-blue">
          ← Back to all sources
        </Link>
      </div>
    </div>
  );
}
