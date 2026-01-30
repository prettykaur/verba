// components/RelatedCluesList.client.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { track } from '@/lib/analytics';

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

function positionLabel(number: number | null, direction: Row['direction']) {
  if (!number || !direction) return null;
  return `${number} ${direction === 'across' ? 'Across' : 'Down'}`;
}

function cleanAnswer(s: string) {
  return (s ?? '').replace(/[^A-Za-z]/g, '').toUpperCase();
}

/** Spoiler-safe answer chip (no JS handlers needed) */
function AnswerChip({
  answer,
  label = 'Answer',
}: {
  answer: string;
  label?: string;
}) {
  const clean = (answer ?? '').trim();
  if (!clean || clean === '—') return null;

  const dotsCount = Math.max(cleanAnswer(clean).length || 3, 1);
  const dots = '•'.repeat(dotsCount);

  return (
    <details className="group inline-flex flex-col items-end">
      <summary className="cursor-pointer list-none">
        <span className="btn-marigold-hover inline-flex h-8 min-w-[96px] items-center justify-center whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 shadow-sm transition">
          <span className="group-open:hidden">
            {label} <span className="ml-1 text-slate-400">{dots}</span>
          </span>
          <span className="hidden group-open:inline">Hide</span>
        </span>
      </summary>

      <span className="mt-2 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm">
        {clean}
      </span>
    </details>
  );
}

export function RelatedCluesList({
  rows,
  currentSourceSlug,
  currentDate,
  seenInCount,
  initialCount = 6,
  step = 6,
}: {
  rows: Row[];
  currentSourceSlug?: string | null;
  currentDate?: string | null;
  seenInCount?: number | null;
  initialCount?: number;
  step?: number;
}) {
  const [visible, setVisible] = useState(initialCount);

  const shown = useMemo(() => rows.slice(0, visible), [rows, visible]);
  const canShowMore = visible < rows.length;

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

          {typeof seenInCount === 'number' && (
            <div className="mt-2 text-xs text-slate-500">
              Seen in {seenInCount} other puzzle{seenInCount === 1 ? '' : 's'}
            </div>
          )}
        </div>

        {rows.length > 0 && (
          <div className="text-xs text-slate-500">
            Showing {Math.min(visible, rows.length)} of {rows.length}
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 text-sm text-slate-600">
          No related clues found yet. More connections coming soon.
        </div>
      ) : (
        <>
          <ul className="mt-4 space-y-3">
            {shown.map((r) => {
              const sourceName = r.source_name ?? r.source_slug ?? 'Crossword';
              const displayDate = r.puzzle_date
                ? formatPuzzleDateLong(r.puzzle_date)
                : null;
              const pos = positionLabel(r.number, r.direction);

              const isSeed = r.source_slug === 'seed';

              const answerForChip = (r.answer_pretty ?? r.answer ?? '—').trim();

              const isSamePuzzle =
                !!currentSourceSlug &&
                !!currentDate &&
                r.source_slug === currentSourceSlug &&
                r.puzzle_date === currentDate;

              return (
                <li key={r.occurrence_id}>
                  {/* Not wrapping whole row in <Link> so the chip stays clickable */}
                  <div className="card-hover-marigold flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    {/* LEFT COLUMN */}
                    <div className="min-w-0 flex-1">
                      {/* Clue */}
                      <Link
                        href={`/clue/${r.occurrence_id}`}
                        className="block font-medium leading-snug text-slate-900 hover:underline"
                        onClick={() => {
                          track('click_related_clue', {
                            from: 'clue_page',
                            occurrence_id: r.occurrence_id,
                            source: r.source_slug ?? '',
                            date: r.puzzle_date ?? '',
                          });
                        }}
                      >
                        {r.clue_text}
                      </Link>

                      {/* Meta row */}
                      <div className="mt-1 text-xs text-slate-500">
                        {r.source_slug && (
                          <Link
                            href={`/answers/${encodeURIComponent(r.source_slug)}`}
                            className="verba-link text-verba-blue"
                          >
                            {sourceName}
                          </Link>
                        )}

                        {displayDate && r.source_slug && !isSeed && (
                          <>
                            {' · '}
                            <Link
                              href={`/answers/${encodeURIComponent(
                                r.source_slug,
                              )}/${encodeURIComponent(r.puzzle_date!)}`}
                              className="verba-link text-verba-blue"
                            >
                              {displayDate}
                            </Link>
                          </>
                        )}

                        {pos && <> · {pos}</>}
                        {isSamePuzzle && (
                          <>
                            {' · '}
                            <span className="font-semibold text-slate-400">
                              same puzzle
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="shrink-0">
                      <AnswerChip answer={answerForChip} label="Answer" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {canShowMore && (
            <button
              type="button"
              onClick={() => setVisible((v) => Math.min(v + step, rows.length))}
              className="btn-marigold-hover btn-press mt-5 inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold"
            >
              Show more related clues
            </button>
          )}
        </>
      )}
    </section>
  );
}
