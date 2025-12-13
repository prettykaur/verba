// app/clue/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { RevealAnswer } from '@/components/RevealAnswer';
import Link from 'next/link';
import { LetterTilesReveal } from '@/components/LetterTilesReveal';

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

type PageParams = { params: Promise<{ id: string }> };

/* ----------------------------
   Letter tiles helper
----------------------------- */
function LetterTiles({ count }: { count: number }) {
  if (!count || count <= 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-500 shadow-sm"
        >
          ?
        </div>
      ))}
    </div>
  );
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

  if (error) {
    console.error('Supabase @clue page:', error);
  }
  if (!data) notFound();

  const row = data as Row;

  const sourceName = row.source_name ?? row.source_slug ?? 'Crossword';
  const date = row.puzzle_date ?? undefined;
  const displayDate = date ? formatPuzzleDateLong(date) : null;

  const positionLabel =
    row.number && row.direction
      ? `${row.number} ${row.direction === 'across' ? 'Across' : 'Down'}`
      : null;

  const displayAnswer = row.answer_pretty ?? row.answer ?? '—';
  const clean = displayAnswer.replace(/[^A-Za-z]/g, '');
  const letterCount = clean.length;

  const puzzleUrl =
    row.source_slug && date
      ? `/answers/${encodeURIComponent(row.source_slug)}/${encodeURIComponent(
          date,
        )}`
      : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
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

      {/* Meta row */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
        {positionLabel && <span>{positionLabel}</span>}
        {positionLabel && <span aria-hidden>·</span>}

        {letterCount > 0 && (
          <>
            <span>
              {letterCount} letter{letterCount === 1 ? '' : 's'}
            </span>
            <span aria-hidden>·</span>
          </>
        )}

        {row.source_slug && (
          <>
            <Link
              href={`/answers/${row.source_slug}`}
              className="verba-link text-verba-blue"
            >
              {sourceName}
            </Link>
            <span aria-hidden>·</span>
          </>
        )}

        {date && (
          <Link
            href={`/answers/${row.source_slug}/${date}${
              row.number && row.direction
                ? `#${row.number}-${row.direction}`
                : ''
            }`}
            className="verba-link text-verba-blue"
          >
            {displayDate}
          </Link>
        )}
      </div>

      {/* Answer block */}
      <section className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          Solve this clue
        </h2>

        {/* Letter tiles */}
        <LetterTilesReveal answer={displayAnswer} />

        <div className="mt-2 text-xs text-slate-500">
          Want the full answer? Use the Reveal button below.
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <RevealAnswer answer={displayAnswer} size="lg" />
        </div>

        <div className="mt-4 border-t pt-4 text-xs text-slate-500">
          Hints & letter-by-letter reveal coming soon.
        </div>
      </section>

      {puzzleUrl && (
        <div className="mt-6 text-sm">
          <Link href={puzzleUrl} className="verba-link text-verba-blue">
            View all clues & answers for this puzzle →
          </Link>
        </div>
      )}
    </main>
  );
}
