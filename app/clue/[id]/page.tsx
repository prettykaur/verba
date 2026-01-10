// app/clue/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { RelatedCluesList } from '@/components/RelatedCluesList.client';
// import { ClueHintActions } from '@/components/ClueHintActions.client';
import { StickyClueSolveBar } from '@/components/StickyClueSolveBar.client';

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

// ✅ Fix: type the “frequency query” rows (no any[])
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

  // --- Related clues (same answer only) ---
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

    const pat = cleanedCurrent;

    const q1 = supabase
      .from('v_search_results_pretty')
      .select(baseSelect)
      .neq('occurrence_id', row.occurrence_id)
      .ilike('answer_pretty', `%${pat}%`)
      .order('puzzle_date', { ascending: false })
      .limit(60);

    const q2 = supabase
      .from('v_search_results_pretty')
      .select(baseSelect)
      .neq('occurrence_id', row.occurrence_id)
      .ilike('answer', `%${pat}%`)
      .order('puzzle_date', { ascending: false })
      .limit(60);

    const [{ data: d1, error: e1 }, { data: d2, error: e2 }] =
      await Promise.all([q1, q2]);

    if (e1) console.error('Supabase @related(answer_pretty):', e1);
    if (e2) console.error('Supabase @related(answer):', e2);

    const merged = [...((d1 ?? []) as Row[]), ...((d2 ?? []) as Row[])];

    const filtered = merged.filter((r) => {
      const candidate = cleanAnswer((r.answer_pretty ?? r.answer ?? '').trim());
      if (!candidate) return false;
      if (candidate !== cleanedCurrent) return false;

      const samePuzzle =
        r.source_slug === row.source_slug && r.puzzle_date === row.puzzle_date;

      return !samePuzzle;
    });

    related = Array.from(
      new Map(filtered.map((r) => [r.occurrence_id, r])).values(),
    );
  }

  // --- Frequency counter ---
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

    // ✅ Fix: no any[]
    const merged: FreqRow[] = [
      ...((freq1 ?? []) as FreqRow[]),
      ...((freq2 ?? []) as FreqRow[]),
    ];

    const unique = new Set<string>();
    for (const r of merged) {
      const candidate = cleanAnswer((r.answer_pretty ?? r.answer ?? '').trim());
      if (candidate !== cleanedCurrent) continue;
      if (!r.source_slug || !r.puzzle_date) continue;
      unique.add(`${r.source_slug}__${r.puzzle_date}`);
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

  // --- Schema.org ItemList JSON-LD for related clues ---
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://example.com';

  const relatedJsonLd =
    related.length === 0
      ? null
      : {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Related crossword clues',
          itemListElement: related.slice(0, 30).map((r, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${site}/clue/${r.occurrence_id}`,
            name: r.clue_text,
          })),
        };

  return (
    <div className="space-y-6">
      {relatedJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedJsonLd) }}
        />
      )}

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

        {/* Sticky solve bar (viewport-level) */}
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

      {/* Related clues */}
      <RelatedCluesList
        rows={related}
        currentSourceSlug={row.source_slug}
        currentDate={row.puzzle_date}
        seenInCount={seenInCount}
        initialCount={6}
        step={6}
      />

      {puzzleUrl && (
        <div className="mt-6 text-sm">
          <Link href={puzzleUrl} className="verba-link text-verba-blue">
            View all clues & answers for this puzzle →
          </Link>
        </div>
      )}
    </div>
  );
}
