// /answers/[source]/[date]/page.tsx
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { HashScroll } from '@/components/HashScroll';
import { DailyAnswersList } from '@/components/DailyAnswersList';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

/* -------------------------------
   CONFIG
-------------------------------- */

const SOURCE_NAMES: Record<string, string> = {
  'nyt-mini': 'NYT Mini',
};

// Unique intro blurbs per hero page
const HERO_INTROS: Record<string, string> = {
  'nyt-mini/2025-10-12':
    'Quick answers for Sunday’s NYT Mini. Short grid, speedy solve.',
  'nyt-mini/2025-10-13':
    'Start the week strong—clean solutions for Monday’s NYT Mini.',
  'nyt-mini/2025-10-14':
    'Every clue explained for Tuesday’s NYT Mini in one tidy list.',
  'nyt-mini/2025-10-15':
    'Midweek Mini? Here are the answers, fast and spoiler-light.',
  'nyt-mini/2025-10-16':
    'All clues & entries for Thursday’s NYT Mini — swift reference.',
  'nyt-mini/2025-10-17':
    'Friday Mini solutions you can skim in seconds. No fluff.',
  'nyt-mini/2025-10-18':
    'Weekend warm-up: NYT Mini answers for a quick brain boost.',
  'nyt-mini/2025-10-19':
    'Sunday snack-size crossword—every answer at a glance.',
  'nyt-mini/2025-10-20':
    'Fresh week, fresh grid: Monday NYT Mini solutions below.',
  'nyt-mini/2025-10-21': 'Clear, concise answers for Tuesday’s NYT Mini. Done.',
};

/* -------------------------------
   TYPES
-------------------------------- */

type PageParams = {
  params: Promise<{ source: string; date: string }>;
};

type SupabaseDailyRow = {
  id: number;
  number: number | null;
  direction: 'across' | 'down' | null;
  answer: string | null;
  answer_display: string | null;

  puzzle_day: {
    puzzle_date: string;
    puzzle_source: {
      slug: string;
      name: string;
    }[];
  }[];

  clue: {
    text: string;
    slug_readable: string;
  }[];
};

/* -------------------------------
   METADATA
-------------------------------- */

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const awaited = await params;
  const source = decodeURIComponent(awaited.source).trim().toLowerCase();
  const isoDate = decodeURIComponent(awaited.date).trim().slice(0, 10);

  const displayDate = formatPuzzleDateLong(isoDate);
  const sourceName = SOURCE_NAMES[source] ?? source;

  const url = `https://tryverba.com/answers/${source}/${isoDate}`;

  return {
    title: `${sourceName} Crossword Answers – ${displayDate} | Verba`,
    description: `Today’s ${sourceName} crossword answers for ${displayDate}. All clues and solutions, updated daily.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${sourceName} Crossword Answers – ${displayDate}`,
      description: `All clues & solutions for ${sourceName} on ${displayDate}.`,
      url,
      type: 'article',
      siteName: 'Verba',
    },
    twitter: {
      card: 'summary',
      title: `${sourceName} Crossword Answers – ${displayDate}`,
      description: `All clues & solutions for ${sourceName} on ${displayDate}.`,
    },
  };
}

/* -------------------------------
   SMALL SHARED COMPONENT
-------------------------------- */

function DayNavigation({
  source,
  prevDate,
  nextDate,
  size = 'sm',
}: {
  source: string;
  prevDate: string | null;
  nextDate: string | null;
  size?: 'xs' | 'sm';
}) {
  return (
    <nav
      className={`flex items-center justify-between text-${size} text-slate-500`}
    >
      {prevDate ? (
        <Link
          href={`/answers/${source}/${prevDate}`}
          className="verba-link text-verba-blue"
        >
          ← {formatPuzzleDateLong(prevDate)}
        </Link>
      ) : (
        <span />
      )}

      {nextDate ? (
        <Link
          href={`/answers/${source}/${nextDate}`}
          className="verba-link text-verba-blue"
        >
          {formatPuzzleDateLong(nextDate)} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

/* -------------------------------
   PAGE
-------------------------------- */

export default async function DailyAnswersPage({ params }: PageParams) {
  const awaited = await params;
  const source = decodeURIComponent(awaited.source).trim().toLowerCase();
  const isoDate = decodeURIComponent(awaited.date).trim().slice(0, 10);
  const displayDate = formatPuzzleDateLong(isoDate);

  const { data: rowsData, error } = await supabase
    .from('clue_occurrence')
    .select(
      `
    id,
    number,
    direction,
    answer,
    answer_display,
    puzzle_day:puzzle_day!inner (
      puzzle_date,
      puzzle_source:puzzle_source!inner ( slug, name )
    ),
    clue:clue!inner ( text, slug_readable )
  `,
    )
    .eq('puzzle_day.puzzle_source.slug', source)
    .eq('puzzle_day.puzzle_date', isoDate)
    .order('number', { ascending: true });

  if (error) console.error('Supabase @daily answers:', error);

  const rows = (rowsData ?? []).map((r: SupabaseDailyRow) => {
    const puzzleDay = r.puzzle_day?.[0];
    const puzzleSource = puzzleDay?.puzzle_source?.[0];
    const clue = r.clue?.[0];

    return {
      occurrence_id: r.id,
      clue_text: clue?.text ?? '',
      clue_slug: clue?.slug_readable ?? null,
      answer: r.answer,
      answer_pretty: r.answer_display,
      number: r.number,
      direction: r.direction,
      source_slug: puzzleSource?.slug ?? source,
      source_name: puzzleSource?.name ?? null,
      puzzle_date: puzzleDay?.puzzle_date ?? isoDate,
    };
  });

  const sourceName = rows[0]?.source_name ?? SOURCE_NAMES[source] ?? source;
  const heroKey = `${source}/${isoDate}`;

  // Prev / next dates (robust + fast)
  const { data: prevRow } = await supabase
    .from('v_search_results_pretty')
    .select('puzzle_date')
    .eq('source_slug', source)
    .lt('puzzle_date', isoDate)
    .order('puzzle_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: nextRow } = await supabase
    .from('v_search_results_pretty')
    .select('puzzle_date')
    .eq('source_slug', source)
    .gt('puzzle_date', isoDate)
    .order('puzzle_date', { ascending: true })
    .limit(1)
    .maybeSingle();

  const prevDate = prevRow?.puzzle_date?.slice(0, 10) ?? null;
  const nextDate = nextRow?.puzzle_date?.slice(0, 10) ?? null;

  return (
    <div className="space-y-6">
      <HashScroll />

      <h1 className="text-2xl font-bold">
        <Link href={`/answers/${source}`} className="verba-link">
          {sourceName}
        </Link>{' '}
        Crossword Answers – {displayDate}
      </h1>

      <p className="text-slate-600">
        {HERO_INTROS[heroKey] ?? (
          <>
            Today’s {sourceName} crossword answers for {displayDate}. Below
            you’ll find all clues and solutions, updated daily.
          </>
        )}
      </p>

      {/* Top navigation */}
      <DayNavigation
        source={source}
        prevDate={prevDate}
        nextDate={nextDate}
        size="xs"
      />

      {rows.length === 0 ? (
        <div className="rounded-xl border bg-white p-6">
          <p className="text-slate-700">
            No data for this date yet. Please check another day.
          </p>
        </div>
      ) : (
        <DailyAnswersList rows={rows} />
      )}

      {/* Bottom navigation */}
      <DayNavigation source={source} prevDate={prevDate} nextDate={nextDate} />

      <hr className="my-10 border-slate-200" />

      {/* Contextual internal links */}
      <section className="space-y-6 text-sm text-slate-600">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            About this puzzle
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            This page contains all clues and answers for the{' '}
            <Link
              href={`/answers/${source}`}
              className="verba-link text-verba-blue"
            >
              {sourceName} crossword
            </Link>{' '}
            published on {displayDate}. The{' '}
            <Link
              href={`/answers/${source}`}
              className="verba-link text-verba-blue"
            >
              {sourceName}
            </Link>{' '}
            is a short-form daily puzzle designed for quick solving, featuring a
            compact grid and straightforward clues.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Looking for another day?
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Use the{' '}
            <Link href="/search" className="verba-link text-verba-blue">
              site search
            </Link>{' '}
            to find answers from other dates, or browse{' '}
            <Link
              href={`/answers/${source}`}
              className="verba-link text-verba-blue"
            >
              recent {sourceName} puzzles
            </Link>
            .
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Stuck on a different clue?
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            <Link href="/search" className="verba-link text-verba-blue">
              Search
            </Link>{' '}
            by clue text or pattern to find answers from other puzzles and
            dates.
          </p>
        </div>
      </section>
    </div>
  );
}
