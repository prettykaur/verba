// app/clue/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { RevealAnswer } from '@/components/RevealAnswer';
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

function positionLabel(number: number | null, direction: Row['direction']) {
  if (!number || !direction) return null;
  return `${number} ${direction === 'across' ? 'Across' : 'Down'}`;
}

function RelatedClues({ rows }: { rows: Row[] }) {
  return (
    <section className="mt-8 rounded-xl border bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Related clues
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Other puzzles where this answer appeared
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 text-sm text-slate-600">
          No related clues found yet. More connections coming soon.
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => {
            const sourceName = r.source_name ?? r.source_slug ?? 'Crossword';
            const displayDate = r.puzzle_date
              ? formatPuzzleDateLong(r.puzzle_date)
              : null;
            const pos = positionLabel(r.number, r.direction);

            return (
              <li key={r.occurrence_id}>
                <Link
                  href={`/clue/${encodeURIComponent(String(r.occurrence_id))}`}
                  className="card-hover-marigold block rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="text-[0.98rem] font-medium leading-snug text-slate-900">
                    {r.clue_text}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {[sourceName, displayDate, pos].filter(Boolean).join(' · ')}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
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
  const clean = displayAnswer.replace(/[^A-Za-z]/g, '');
  const letterCount = clean.length;

  const puzzleUrl =
    row.source_slug && date
      ? `/answers/${encodeURIComponent(row.source_slug)}/${encodeURIComponent(
          date,
        )}`
      : null;

  // --- Related clues (same answer only, case-insensitive) ---
  // Use two safe queries (avoid PostgREST .or() string issues with commas/quotes).
  let related: Row[] = [];

  if (displayAnswer && displayAnswer !== '—') {
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
      .ilike('answer_pretty', displayAnswer)
      .order('puzzle_date', { ascending: false })
      .limit(12);

    const q2 = supabase
      .from('v_search_results_pretty')
      .select(baseSelect)
      .neq('occurrence_id', row.occurrence_id)
      .ilike('answer', displayAnswer)
      .order('puzzle_date', { ascending: false })
      .limit(12);

    const [{ data: d1, error: e1 }, { data: d2, error: e2 }] =
      await Promise.all([q1, q2]);

    if (e1) console.error('Supabase @related(answer_pretty):', e1);
    if (e2) console.error('Supabase @related(answer):', e2);

    const merged = [...((d1 ?? []) as Row[]), ...((d2 ?? []) as Row[])];

    related = Array.from(
      new Map(merged.map((r) => [r.occurrence_id, r])).values(),
    ).slice(0, 6);
  }

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
        {posLabel && <span>{posLabel}</span>}
        {posLabel && <span aria-hidden>·</span>}

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

        {/* ✅ Letter tiles (per-letter reveal) */}
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

      {/* ✅ Related clues (same answer) */}
      <RelatedClues rows={related} />

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
