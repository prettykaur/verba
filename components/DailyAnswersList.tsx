// components/DailyAnswersList.tsx
'use client';

import { useState } from 'react';
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
  puzzle_date: string; // 'YYYY-MM-DD'
};

export function DailyAnswersList({ rows }: { rows: Row[] }) {
  const [revealAll, setRevealAll] = useState(false);
  const [version, setVersion] = useState(0);

  const handleToggleAll = () => {
    setRevealAll((prev) => {
      const next = !prev;
      // bump version so all RevealAnswer instances resync
      setVersion((v) => v + 1);
      return next;
    });
  };

  if (rows.length === 0) return null;

  return (
    <div className="mt-6">
      {/* Small global toggle above the list */}
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={handleToggleAll}
          className="btn-marigold-hover inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium text-slate-800"
        >
          {revealAll ? 'Hide all answers' : 'Reveal all answers'}
        </button>
      </div>

      <ul className="mt-2 divide-y rounded-xl border bg-white">
        {rows.map((r) => {
          const positionLabel =
            r.number && r.direction
              ? `${r.number} ${r.direction === 'across' ? 'Across' : 'Down'}`
              : '—';

          // anchor ID used for deep-linking from search results
          const anchorId =
            r.number && r.direction
              ? `${r.number}-${r.direction.toLowerCase()}`
              : `clue-${r.occurrence_id}`;

          const displayAnswer = r.answer_pretty ?? r.answer ?? '—';

          return (
            <li
              id={anchorId}
              key={r.occurrence_id}
              className="flex items-start justify-between gap-4 p-4"
            >
              <div>
                <div className="text-slate-800">{r.clue_text}</div>
                <div className="text-xs text-slate-500">
                  {positionLabel} ·{' '}
                  {r.puzzle_date ? formatPuzzleDateLong(r.puzzle_date) : '—'}
                </div>
              </div>

              <RevealAnswer
                answer={displayAnswer}
                size="md"
                startRevealed={revealAll}
                version={version}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
