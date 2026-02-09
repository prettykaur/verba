// app/clue/[param]/page.tsx
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { RelatedCluesList } from '@/components/RelatedCluesList.client';
import { StickyClueSolveBar } from '@/components/StickyClueSolveBar.client';
import { CluePrevNextNav } from '@/components/CluePrevNextNav.client';
import { ClueFAQ } from '@/components/ClueFAQ';
import { encodeQuickClueSlug } from '@/lib/quickClueSlug';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* ---------------------------------------------------------
   Types
--------------------------------------------------------- */

type OccurrenceRow = {
  occurrence_id: number;
  clue_text: string;
  clue_slug: string;
  answer: string | null;
  answer_pretty: string | null;
  number: number | null;
  direction: 'across' | 'down' | null;
  source_slug: string;
  source_name: string;
  puzzle_date: string; // ISO yyyy-mm-dd
};

type PageProps = {
  params: Promise<{ param: string }>;
  searchParams?: Promise<{ occ?: string }>;
};

type SupabasePuzzleSource = {
  slug: string;
  name: string;
};

type SupabasePuzzleDay = {
  puzzle_date: string;
  puzzle_source: SupabasePuzzleSource[];
};

type SupabaseClue = {
  text: string;
  slug_readable: string;
};

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function cleanAnswer(s: string) {
  return (s ?? '').replace(/[^A-Za-z]/g, '').toUpperCase();
}

function positionLabel(
  number: number | null,
  direction: 'across' | 'down' | null,
) {
  if (!number || !direction) return null;
  return `${number} ${direction === 'across' ? 'Across' : 'Down'}`;
}

function clueOrderKey(
  direction: 'across' | 'down' | null,
  number: number | null,
) {
  return {
    dirRank: direction === 'across' ? 0 : 1,
    num: number ?? 0,
  };
}

async function fetchPrevNextClues(row: OccurrenceRow) {
  if (!row.source_slug || !row.puzzle_date) {
    return { prev: null, next: null };
  }

  const { data, error } = await supabase
    .from('v_search_results_pretty')
    .select('occurrence_id, clue_text, number, direction')
    .eq('source_slug', row.source_slug)
    .eq('puzzle_date', row.puzzle_date);

  if (error || !data || data.length === 0) {
    console.error('[fetchPrevNextClues] supabase error:', error);
    return { prev: null, next: null };
  }

  const ordered = data.slice().sort((a, b) => {
    const A = clueOrderKey(a.direction, a.number);
    const B = clueOrderKey(b.direction, b.number);
    if (A.dirRank !== B.dirRank) return A.dirRank - B.dirRank;
    return A.num - B.num;
  });

  const idx = ordered.findIndex((c) => c.occurrence_id === row.occurrence_id);

  return {
    prev:
      idx > 0
        ? {
            occurrence_id: ordered[idx - 1].occurrence_id,
            clue_text: ordered[idx - 1].clue_text,
          }
        : null,
    next:
      idx >= 0 && idx < ordered.length - 1
        ? {
            occurrence_id: ordered[idx + 1].occurrence_id,
            clue_text: ordered[idx + 1].clue_text,
          }
        : null,
  };
}

function first<T>(v: T[] | null | undefined): T | null {
  return v?.[0] ?? null;
}

/* ---------------------------------------------------------
   Data fetchers (OBJECTS, not arrays)
--------------------------------------------------------- */

async function fetchOccurrenceById(
  occId: number,
): Promise<OccurrenceRow | null> {
  const { data, error } = await supabase
    .from('clue_occurrence')
    .select(
      `
      id,
      number,
      direction,
      answer,
      answer_display,
      puzzle_day!inner (
        puzzle_date,
        puzzle_source!inner ( slug, name )
      ),
      clue!inner (
        text,
        slug_readable
      )
    `,
    )
    .eq('id', occId)
    .maybeSingle();

  if (error) {
    console.error('[fetchOccurrenceById] supabase error:', error);
    return null;
  }
  if (!data) return null;

  // ✅ these are OBJECTS for many-to-one relations
  const puzzleDay =
    (data.puzzle_day as SupabasePuzzleDay[] | null)?.[0] ?? null;
  const puzzleSource = puzzleDay?.puzzle_source?.[0] ?? null;
  const clue = (data.clue as SupabaseClue[] | null)?.[0] ?? null;

  if (!puzzleDay?.puzzle_date || !puzzleSource?.slug || !clue?.slug_readable) {
    return null;
  }

  return {
    occurrence_id: data.id,
    clue_text: clue.text,
    clue_slug: clue.slug_readable,
    answer: data.answer,
    answer_pretty: data.answer_display,
    number: data.number,
    direction: data.direction,
    source_slug: puzzleSource.slug,
    source_name: puzzleSource.name,
    puzzle_date: String(puzzleDay.puzzle_date).slice(0, 10),
  };
}

async function fetchLatestOccurrenceForSlug(
  slug: string,
): Promise<OccurrenceRow | null> {
  const { data, error } = await supabase
    .from('v_search_results_pretty')
    .select(
      `
      occurrence_id,
      clue_text,
      clue_slug_readable,
      answer,
      answer_pretty,
      number,
      direction,
      source_slug,
      source_name,
      puzzle_date
    `,
    )
    .eq('clue_slug_readable', slug)
    .order('puzzle_date', { ascending: false })
    .order('occurrence_id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      '[fetchLatestOccurrenceForSlug(view)] supabase error:',
      error,
    );
    return null;
  }
  if (!data) return null;

  return {
    occurrence_id: data.occurrence_id,
    clue_text: data.clue_text,
    clue_slug: data.clue_slug_readable,
    answer: data.answer,
    answer_pretty: data.answer_pretty,
    number: data.number,
    direction: data.direction,
    source_slug: data.source_slug,
    source_name: data.source_name,
    puzzle_date: String(data.puzzle_date).slice(0, 10),
  };
}

async function fetchRelatedClues(
  current: OccurrenceRow,
  limit = 60,
): Promise<OccurrenceRow[]> {
  const answer = (current.answer_pretty ?? current.answer ?? '').trim();

  if (!answer) return [];

  const { data, error } = await supabase
    .from('v_search_results_pretty')
    .select(
      `
      occurrence_id,
      clue_text,
      clue_slug_readable,
      answer,
      answer_pretty,
      number,
      direction,
      source_slug,
      source_name,
      puzzle_date
    `,
    )
    .neq('occurrence_id', current.occurrence_id)
    .or(`answer_pretty.eq.${answer},answer.eq.${answer}`)
    .limit(limit);

  if (error) {
    console.error('[fetchRelatedClues] supabase error:', error);
    return [];
  }

  return (data ?? []).map(
    (r: {
      occurrence_id: number;
      clue_text: string;
      clue_slug_readable: string;
      answer: string | null;
      answer_pretty: string | null;
      number: number | null;
      direction: 'across' | 'down' | null;
      source_slug: string;
      source_name: string;
      puzzle_date: string;
    }) => ({
      occurrence_id: r.occurrence_id,
      clue_text: r.clue_text,
      clue_slug: r.clue_slug_readable,
      answer: r.answer,
      answer_pretty: r.answer_pretty,
      number: r.number,
      direction: r.direction,
      source_slug: r.source_slug,
      source_name: r.source_name,
      puzzle_date: r.puzzle_date?.slice(0, 10),
    }),
  );
}

async function fetchAnswerStats(row: OccurrenceRow) {
  const answer = (row.answer_pretty ?? row.answer ?? '').trim();
  if (!answer) {
    return {
      seenInCount: null,
      otherCluesForSameAnswer: [],
    };
  }

  const { data, count, error } = await supabase
    .from('v_search_results_pretty')
    .select('occurrence_id, clue_text', {
      count: 'exact',
    })
    .or(`answer.eq.${answer},answer_pretty.eq.${answer}`);

  if (error || !data) {
    console.error('[fetchAnswerStats] supabase error:', error);
    return {
      seenInCount: null,
      otherCluesForSameAnswer: [],
    };
  }

  // Exclude the current occurrence
  const filtered = data.filter((r) => r.occurrence_id !== row.occurrence_id);

  return {
    seenInCount: typeof count === 'number' ? Math.max(count - 1, 0) : null,
    otherCluesForSameAnswer: filtered
      .map((r) => r.clue_text)
      .filter(Boolean)
      .slice(0, 50),
  };
}

/* ---------------------------------------------------------
   Metadata
--------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ param: string }>;
}): Promise<Metadata> {
  const { param } = await params;
  const decoded = decodeURIComponent(param);

  const row = /^\d+$/.test(decoded)
    ? await fetchOccurrenceById(Number(decoded))
    : await fetchLatestOccurrenceForSlug(decoded);

  if (!row) {
    return {
      title: 'Crossword Clue | Verba',
      description: 'Crossword clue and answer.',
    };
  }

  const title = `${row.clue_text} — Crossword Clue Answer | Verba`;
  const description = `See the answer for "${row.clue_text}" from the ${row.source_name} crossword.`;

  return {
    title,
    description,
    alternates: { canonical: `https://tryverba.com/clue/${row.clue_slug}` },
  };
}

/* ---------------------------------------------------------
   Page
--------------------------------------------------------- */

export default async function CluePage({ params, searchParams }: PageProps) {
  const { param } = await params;
  const sp = searchParams ? await searchParams : {};
  const decoded = decodeURIComponent(param);

  const occFromQuery = sp.occ && /^\d+$/.test(sp.occ) ? Number(sp.occ) : null;

  // Numeric URL → redirect to canonical slug
  if (/^\d+$/.test(decoded)) {
    const occ = await fetchOccurrenceById(Number(decoded));
    if (!occ) notFound();
    permanentRedirect(`/clue/${occ.clue_slug}?occ=${occ.occurrence_id}`);
  }

  // If we have ?occ=123 and it matches the slug, prefer it
  let row: OccurrenceRow | null = null;

  if (occFromQuery) {
    const occ = await fetchOccurrenceById(occFromQuery);
    if (occ && occ.clue_slug === decoded) row = occ;
  }

  if (!row) row = await fetchLatestOccurrenceForSlug(decoded);
  if (!row) notFound();

  const displayAnswer = (row.answer_pretty ?? row.answer ?? '—').trim();
  const cleaned = cleanAnswer(displayAnswer);
  const letterCount = cleaned.length;

  const quickClueSlug =
    letterCount > 0 ? encodeQuickClueSlug(row.clue_text, letterCount) : null;

  const quickClueHref = quickClueSlug
    ? `/quick-clue/${encodeURIComponent(quickClueSlug)}`
    : null;

  const posLabel = positionLabel(row.number, row.direction);
  const displayDate = formatPuzzleDateLong(row.puzzle_date);

  const related = await fetchRelatedClues(row);
  const { seenInCount, otherCluesForSameAnswer } = await fetchAnswerStats(row);

  const { prev, next } = await fetchPrevNextClues(row);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the answer to "${row.clue_text}"?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: displayAnswer,
        },
      },
      {
        '@type': 'Question',
        name: `How many letters is the answer to "${row.clue_text}"?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The answer has ${letterCount} letters.`,
        },
      },
      ...(displayDate && row.source_name
        ? [
            {
              '@type': 'Question',
              name: 'When was this clue last seen?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: `This clue last appeared in the ${row.source_name} crossword on ${displayDate}.`,
              },
            },
          ]
        : []),
    ],
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="verba-link text-verba-blue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/search" className="verba-link text-verba-blue">
          Search
        </Link>

        {row.source_slug && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/answers/${encodeURIComponent(row.source_slug)}`}
              className="verba-link text-verba-blue"
            >
              {row.source_name ?? row.source_slug}
            </Link>
          </>
        )}
      </nav>

      <h1 className="text-2xl font-bold">{row.clue_text}</h1>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
        {posLabel && <span>{posLabel}</span>}
        {letterCount > 0 && (
          <>
            <span aria-hidden>·</span>
            <span>{letterCount} letters</span>
          </>
        )}
        {row.puzzle_date && (
          <>
            <span aria-hidden>·</span>
            <Link
              href={`/answers/${encodeURIComponent(row.source_slug)}/${encodeURIComponent(
                row.puzzle_date,
              )}`}
              className="verba-link text-verba-blue"
            >
              {displayDate}
            </Link>
          </>
        )}
      </div>

      {/* Solve card wrapper (restores formatting) */}
      <section className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          Solve this clue
        </h2>

        <StickyClueSolveBar
          clueText={row.clue_text}
          answer={displayAnswer}
          answerFrequency={
            typeof seenInCount === 'number' && seenInCount > 0
              ? seenInCount + 1
              : undefined
          }
          otherCluesForSameAnswer={otherCluesForSameAnswer}
          definition={null}
        />

        {typeof seenInCount === 'number' && seenInCount > 0 && (
          <div className="mt-3 text-xs text-slate-500">
            Answer appears in{' '}
            <strong className="font-medium text-slate-700">
              {seenInCount}
            </strong>{' '}
            other puzzle{seenInCount === 1 ? '' : 's'}
          </div>
        )}

        <div className="mt-4 border-t pt-4 text-xs text-slate-500">
          Hints & letter-by-letter reveal coming soon.
        </div>
      </section>

      {/* About section (restores missing content) */}
      <section className="mt-6 rounded-xl border bg-slate-50 p-4 text-sm">
        <h2 className="font-semibold">About this clue</h2>
        <p className="mt-1 text-slate-700">
          This clue appeared in the {row.source_name ?? row.source_slug}{' '}
          crossword
          {displayDate ? ` on ${displayDate}` : ''}. The answer{' '}
          <strong>{displayAnswer}</strong> is a {letterCount}-letter entry.
        </p>
      </section>

      <CluePrevNextNav prev={prev} next={next} />

      {/* Puzzle link */}
      <div className="mt-6 text-sm">
        <Link
          href={`/answers/${encodeURIComponent(row.source_slug)}/${encodeURIComponent(
            row.puzzle_date,
          )}`}
          className="verba-link text-verba-blue"
        >
          View all clues & answers for this puzzle →
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <ClueFAQ
        clue={row.clue_text}
        answer={displayAnswer}
        letterCount={letterCount}
        puzzleDate={displayDate}
        sourceName={row.source_name}
        sourceHref={`/answers/${encodeURIComponent(row.source_slug)}`}
        dateHref={`/answers/${encodeURIComponent(
          row.source_slug,
        )}/${encodeURIComponent(row.puzzle_date)}`}
        seenInCount={seenInCount}
      />

      {quickClueHref && (
        <section className="rounded-xl border bg-slate-50 p-4 text-sm">
          <p className="text-slate-700">
            Looking for a <strong>{letterCount}-letter word</strong> for{' '}
            <strong>“{row.clue_text}”</strong>?
          </p>
          <p className="mt-1">
            <Link href={quickClueHref} className="verba-link text-verba-blue">
              View quick crossword answers →
            </Link>
          </p>
        </section>
      )}

      {/* Related clues */}
      <RelatedCluesList
        rows={related}
        currentSourceSlug={row.source_slug}
        currentDate={row.puzzle_date}
        initialCount={6}
        step={6}
      />
    </div>
  );
}
