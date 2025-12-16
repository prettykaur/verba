// components/ClueHintActions.client.tsx
'use client';

import { useState } from 'react';
import { HintsSection } from '@/components/HintsSection';
import { LetterTilesReveal } from '@/components/LetterTilesReveal';

export function ClueHintActions({
  clueText,
  answer,
  answerFrequency,
  otherCluesForSameAnswer,
  definition,
}: {
  clueText: string;
  answer: string;
  answerFrequency?: number;
  otherCluesForSameAnswer?: string[];
  definition?: string | null;
}) {
  const [revealNextSignal, setRevealNextSignal] = useState(0);
  const [revealAll, setRevealAll] = useState(false);

  return (
    <>
      {/* Tiles left, reveal buttons right */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <LetterTilesReveal
          answer={answer}
          revealAll={revealAll}
          revealNextSignal={revealNextSignal}
          className=""
        />

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRevealNextSignal((n) => n + 1)}
            className="btn-marigold-hover btn-press inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition"
          >
            Reveal next
          </button>

          <button
            type="button"
            onClick={() => setRevealAll(true)}
            disabled={revealAll}
            className={[
              'btn-press inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold shadow-sm transition',
              revealAll
                ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                : 'btn-marigold-hover border-slate-200 bg-white text-slate-700',
            ].join(' ')}
          >
            Reveal all
          </button>
        </div>
      </div>

      <HintsSection
        clueText={clueText}
        answer={answer}
        answerFrequency={answerFrequency}
        otherCluesForSameAnswer={otherCluesForSameAnswer}
        definition={definition}
      />
    </>
  );
}
