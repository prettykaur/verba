// app/clue/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { RevealAnswer } from '@/components/RevealAnswer';

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
      <h1 className="text-2xl font-bold">{row.clue_text}</h1>

      <p className="mt-2 text-sm text-slate-600">
        {positionLabel && <span>{positionLabel}</span>}
        {positionLabel && (sourceName || displayDate) && (
          <span aria-hidden> · </span>
        )}
        {sourceName && <span>{sourceName}</span>}
        {sourceName && displayDate && <span aria-hidden> · </span>}
        {displayDate && <span>{displayDate}</span>}
      </p>

      {/* Answer block */}
      <section className="mt-6 rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Crossword answer
            </h2>
            {letterCount > 0 && (
              <p className="mt-1 text-sm text-slate-500">
                {letterCount} letter{letterCount === 1 ? '' : 's'}
              </p>
            )}
          </div>

          <RevealAnswer answer={displayAnswer} size="lg" />
        </div>

        {/* Placeholder for future hints */}
        <div className="mt-4 border-t pt-4 text-xs text-slate-500">
          Hints & letter-by-letter reveal coming soon.
        </div>
      </section>

      {puzzleUrl && (
        <div className="mt-6 text-sm">
          <a href={puzzleUrl} className="verba-link text-verba-blue">
            View all clues & answers for this puzzle →
          </a>
        </div>
      )}
    </main>
  );
}
