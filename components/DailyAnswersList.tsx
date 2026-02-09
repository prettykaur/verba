// components/DailyAnswersList.tsx

'use client';

import { useState } from 'react';
import { RevealAnswer } from '@/components/RevealAnswer';
import Link from 'next/link';
import { track } from '@/lib/analytics';
import { encodeQuickClueSlug } from '@/lib/quickClueSlug';

type Row = {
  occurrence_id: number;
  clue_text: string;
  clue_slug: string | null;
  answer: string | null;
  answer_pretty: string | null;
  number: number | null;
  direction: 'across' | 'down' | null;
  source_slug: string;
  source_name: string | null;
  puzzle_date: string;
};

export function DailyAnswersList({ rows }: { rows: Row[] }) {
  const [revealAll, setRevealAll] = useState(false);
  const [version, setVersion] = useState(0);

  const handleToggleAll = () => {
    setRevealAll((prev) => {
      const next = !prev;
      setVersion((v) => v + 1);
      return next;
    });
  };

  if (rows.length === 0) return null;

  const acrossRows = rows
    .filter((r) => r.direction === 'across')
    .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

  const downRows = rows
    .filter((r) => r.direction === 'down')
    .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

  const renderGroup = (title: string, group: Row[], withTopBorder = false) => {
    if (group.length === 0) return null;

    return (
      <section
        className={
          withTopBorder ? 'mt-8 border-t border-slate-200 pt-6' : 'mt-6'
        }
      >
        <h2 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </h2>

        <ul className="divide-y rounded-xl border bg-white">
          {group.map((r) => {
            const directionLabel =
              r.direction === 'across'
                ? 'Across'
                : r.direction === 'down'
                  ? 'Down'
                  : '';

            const anchorId =
              r.number && r.direction
                ? `${r.number}-${r.direction.toLowerCase()}`
                : `clue-${r.occurrence_id}`;

            const displayAnswer = r.answer_pretty ?? r.answer ?? '—';

            // letter-count hint (A–Z only)
            const letters = (displayAnswer ?? '').replace(/[^A-Za-z]/g, '');
            const lettersLabel =
              letters.length > 0
                ? `${letters.length} letter${letters.length === 1 ? '' : 's'}`
                : '';

            // Quick-clue link (safe, canonical)
            const letterCount = letters.length;

            const quickClueSlug =
              letterCount > 0
                ? encodeQuickClueSlug(r.clue_text, letterCount)
                : null;

            const quickClueHref = quickClueSlug
              ? `/quick-clue/${encodeURIComponent(quickClueSlug)}`
              : null;

            const metaBits: string[] = [];
            if (directionLabel) metaBits.push(directionLabel);
            if (lettersLabel) metaBits.push(lettersLabel);
            // if (r.puzzle_date)
            //   metaBits.push(formatPuzzleDateLong(r.puzzle_date));

            return (
              <li
                id={anchorId}
                key={r.occurrence_id}
                className="card-hover-marigold card-lift flex scroll-mt-24 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  {typeof r.number === 'number' && (
                    <div className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-[11px] font-semibold text-slate-600">
                      {r.number}
                    </div>
                  )}

                  <Link
                    href={`/clue/${r.clue_slug}`}
                    className="block no-underline"
                    onClick={() => {
                      track('click_clue_from_daily', {
                        occurrence_id: r.occurrence_id,
                        source: r.source_slug,
                        date: r.puzzle_date,
                        direction: r.direction ?? '',
                        number: r.number ?? 0,
                      });
                    }}
                  >
                    <div className="verba-link text-[0.98rem] font-medium leading-snug text-slate-900">
                      {r.clue_text}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {metaBits.join(' · ')}
                    </div>
                  </Link>
                </div>

                <div className="space-y-1 sm:self-end">
                  <RevealAnswer
                    answer={displayAnswer}
                    size="sm"
                    startRevealed={revealAll}
                    version={version}
                    eventProps={{
                      context: 'daily_answers',
                      source: r.source_slug,
                      date: r.puzzle_date,
                      occurrence_id: r.occurrence_id,
                      direction: r.direction ?? '',
                      number: r.number ?? 0,
                    }}
                  />

                  {quickClueHref && (
                    <div className="text-[11px] text-slate-500">
                      Looking for a <strong>{letterCount}-letter word</strong>{' '}
                      for <strong>“{r.clue_text}”</strong>?{' '}
                      <Link
                        href={quickClueHref}
                        className="verba-link text-verba-blue"
                      >
                        Quick answers →
                      </Link>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    );
  };

  return (
    <div className="mt-6">
      {/* Global toggle above everything */}
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={handleToggleAll}
          aria-pressed={revealAll}
          className="btn-marigold-hover btn-press inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium text-slate-800"
        >
          {revealAll ? 'Hide all answers' : 'Reveal all answers'}
        </button>
      </div>

      {renderGroup('Across', acrossRows, false)}
      {renderGroup('Down', downRows, true)}
    </div>
  );
}
