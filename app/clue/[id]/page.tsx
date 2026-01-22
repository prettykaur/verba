// app/clue/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { RelatedCluesList } from '@/components/RelatedCluesList.client';
import { StickyClueSolveBar } from '@/components/StickyClueSolveBar.client';
import { CluePrevNextNav } from '@/components/CluePrevNextNav.client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Row = {
  occurrence_id: number;
  clue_text: string;
  answer: string | null;
  answer_pretty: string | null;
  number: number | null;
  direction: 'across' | 'down' | null;
  source_slug: string;
  source_name: string | null;
  puzzle_date: string | null;
};

type FreqRow = {
  source_slug: string | null;
  puzzle_date: string | null;
  answer: string | null;
  answer_pretty: string | null;
};

type PageParams = { params: Promise<{ id: string }> };

function positionLabel(number: number | null, direction: Row['direction']) {
  if (!number || !direction) return null;
  return `${number} ${direction === 'across' ? 'Across' : 'Down'}`;
}

function cleanAnswer(s: string) {
  return (s ?? '').replace(/[^A-Za-z]/g, '').toUpperCase();
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

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const awaited = await params;
  const idNum = Number(awaited.id);
  if (!Number.isFinite(idNum)) return { title: 'Crossword Clue | Verba' };

  const { data } = await supabase
    .from('v_search_results_pretty')
    .select(
      `
      clue_text,
      answer,
      answer_pretty,
      source_name,
      source_slug,
      puzzle_date
      `,
    )
    .eq('occurrence_id', idNum)
    .maybeSingle();

  if (!data) {
    return {
      title: 'Crossword Clue Not Found | Verba',
      description: 'This crossword clue could not be found.',
    };
  }

  const row = data as Row;
  const sourceName = row.source_name ?? row.source_slug ?? 'Crossword';
  const clueText = row.clue_text;
  const date = row.puzzle_date ?? undefined;
  const displayDate = date ? formatPuzzleDateLong(date) : null;

  const baseTitle = `${clueText} — Crossword Clue Answer | Verba`;
  const descriptionParts = [
    `See the answer for "${clueText}".`,
    sourceName && date
      ? `From ${sourceName} on ${displayDate}.`
      : sourceName
        ? `From ${sourceName}.`
        : null,
  ].filter(Boolean);

  return {
    title: baseTitle,
    description: descriptionParts.join(' '),
    alternates: {
      canonical: `https://tryverba.com/clue/${idNum}`,
    },
    openGraph: {
      title: baseTitle,
      description: descriptionParts.join(' '),
      type: 'article',
      siteName: 'Verba',
    },
    twitter: {
      card: 'summary',
      title: baseTitle,
      description: descriptionParts.join(' '),
    },
  };
}

export default async function CluePage({ params }: PageParams) {
  const awaited = await params;
  const idNum = Number(awaited.id);
  if (!Number.isFinite(idNum)) notFound();

  const { data, error } = await supabase
    .from('v_search_results_pretty')
    .select(
      `
      occurrence_id,
      clue_text,
      answer,
      answer_pretty,
      number,
      direction,
      source_slug,
      source_name,
      puzzle_date
      `,
    )
    .eq('occurrence_id', idNum)
    .maybeSingle();

  if (error) console.error('Supabase @clue page:', error);
  if (!data) notFound();

  const row = data as Row;

  const sourceName = row.source_name ?? row.source_slug ?? 'Crossword';
  const date = row.puzzle_date ?? undefined;
  const displayDate = date ? formatPuzzleDateLong(date) : null;

  const posLabel = positionLabel(row.number, row.direction);

  const displayAnswer = (row.answer_pretty ?? row.answer ?? '—').trim();
  const cleanedCurrent = cleanAnswer(displayAnswer);
  const letterCount = cleanedCurrent.length;

  const puzzleUrl =
    row.source_slug && date
      ? `/answers/${encodeURIComponent(row.source_slug)}/${encodeURIComponent(date)}`
      : null;

  /* ------------------------------------------------------------------ */
  /* Previous / Next clue navigation                                     */
  /* ------------------------------------------------------------------ */

  let prevClue: { occurrence_id: number; clue_text: string } | null = null;
  let nextClue: { occurrence_id: number; clue_text: string } | null = null;

  if (row.source_slug && row.puzzle_date) {
    const { data: allClues } = await supabase
      .from('v_search_results_pretty')
      .select('occurrence_id, clue_text, number, direction')
      .eq('source_slug', row.source_slug)
      .eq('puzzle_date', row.puzzle_date);

    if (allClues && allClues.length > 0) {
      const ordered = allClues.slice().sort((a, b) => {
        const A = clueOrderKey(a.direction, a.number);
        const B = clueOrderKey(b.direction, b.number);
        if (A.dirRank !== B.dirRank) return A.dirRank - B.dirRank;
        return A.num - B.num;
      });

      const idx = ordered.findIndex(
        (c) => c.occurrence_id === row.occurrence_id,
      );

      if (idx > 0) {
        prevClue = {
          occurrence_id: ordered[idx - 1].occurrence_id,
          clue_text: ordered[idx - 1].clue_text,
        };
      }

      if (idx >= 0 && idx < ordered.length - 1) {
        nextClue = {
          occurrence_id: ordered[idx + 1].occurrence_id,
          clue_text: ordered[idx + 1].clue_text,
        };
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Related clues + frequency logic (unchanged)                         */
  /* ------------------------------------------------------------------ */

  let related: Row[] = [];

  if (cleanedCurrent && displayAnswer !== '—') {
    const baseSelect = `
      occurrence_id,
      clue_text,
      answer,
      answer_pretty,
      number,
      direction,
      source_slug,
      source_name,
      puzzle_date
    `;

    const q1 = supabase
      .from('v_search_results_pretty')
      .select(baseSelect)
      .neq('occurrence_id', row.occurrence_id)
      .ilike('answer_pretty', `%${cleanedCurrent}%`)
      .limit(60);

    const q2 = supabase
      .from('v_search_results_pretty')
      .select(baseSelect)
      .neq('occurrence_id', row.occurrence_id)
      .ilike('answer', `%${cleanedCurrent}%`)
      .limit(60);

    const [{ data: d1 }, { data: d2 }] = await Promise.all([q1, q2]);

    const merged = [...((d1 ?? []) as Row[]), ...((d2 ?? []) as Row[])];

    related = Array.from(
      new Map(
        merged
          .filter((r) => {
            const candidate = cleanAnswer(
              (r.answer_pretty ?? r.answer ?? '').trim(),
            );
            return (
              candidate === cleanedCurrent &&
              !(
                r.source_slug === row.source_slug &&
                r.puzzle_date === row.puzzle_date
              )
            );
          })
          .map((r) => [r.occurrence_id, r]),
      ).values(),
    );
  }

  let seenInCount: number | null = null;

  if (cleanedCurrent && displayAnswer !== '—') {
    const { data: freq1 } = await supabase
      .from('v_search_results_pretty')
      .select('source_slug,puzzle_date,answer,answer_pretty')
      .ilike('answer_pretty', `%${cleanedCurrent}%`)
      .limit(500);

    const { data: freq2 } = await supabase
      .from('v_search_results_pretty')
      .select('source_slug,puzzle_date,answer,answer_pretty')
      .ilike('answer', `%${cleanedCurrent}%`)
      .limit(500);

    const merged: FreqRow[] = [
      ...((freq1 ?? []) as FreqRow[]),
      ...((freq2 ?? []) as FreqRow[]),
    ];

    const unique = new Set<string>();
    for (const r of merged) {
      const candidate = cleanAnswer((r.answer_pretty ?? r.answer ?? '').trim());
      if (candidate === cleanedCurrent && r.source_slug && r.puzzle_date) {
        unique.add(`${r.source_slug}__${r.puzzle_date}`);
      }
    }

    if (row.source_slug && row.puzzle_date) {
      unique.delete(`${row.source_slug}__${row.puzzle_date}`);
    }

    seenInCount = unique.size;
  }

  const otherCluesForSameAnswer = related
    .map((r) => r.clue_text)
    .filter(Boolean)
    .slice(0, 50);

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

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
              href={`/answers/${row.source_slug}`}
              className="verba-link text-verba-blue"
            >
              {sourceName}
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
        {date && (
          <>
            <span aria-hidden>·</span>
            <Link
              href={`/answers/${row.source_slug}/${date}`}
              className="verba-link text-verba-blue"
            >
              {displayDate}
            </Link>
          </>
        )}
      </div>

      <section className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          Solve this clue
        </h2>

        <StickyClueSolveBar
          clueText={row.clue_text}
          answer={displayAnswer}
          answerFrequency={
            typeof seenInCount === 'number' ? seenInCount + 1 : undefined
          }
          otherCluesForSameAnswer={otherCluesForSameAnswer}
          definition={null}
        />

        <div className="mt-4 border-t pt-4 text-xs text-slate-500">
          Hints & letter-by-letter reveal coming soon.
        </div>
      </section>

      <section className="mt-6 rounded-xl border bg-slate-50 p-4 text-sm">
        <h2 className="font-semibold">About this clue</h2>
        <p className="mt-1 text-slate-700">
          This clue appeared in the {sourceName} crossword
          {displayDate ? ` on ${displayDate}` : ''}. The answer{' '}
          <strong>{displayAnswer}</strong> is a {letterCount}-letter entry.
        </p>
      </section>

      <CluePrevNextNav prev={prevClue} next={nextClue} />

      {puzzleUrl && (
        <div className="mt-6 text-sm">
          <Link href={puzzleUrl} className="verba-link text-verba-blue">
            View all clues & answers for this puzzle →
          </Link>
        </div>
      )}

      <RelatedCluesList
        rows={related}
        currentSourceSlug={row.source_slug}
        currentDate={row.puzzle_date}
        seenInCount={seenInCount}
        initialCount={6}
        step={6}
      />
    </div>
  );
}
