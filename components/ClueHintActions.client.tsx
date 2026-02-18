// components/ClueHintActions.client.tsx

'use client';

import { useState } from 'react';
import { HintsSection } from '@/components/HintsSection';
import { LetterTilesReveal } from '@/components/LetterTilesReveal';
import { track } from '@/lib/analytics';

export function ClueHintActions({
  clueText,
  answer,
  answerFrequency,
  otherCluesForSameAnswer,
  definition,
  mode = 'inline',
}: {
  clueText: string;
  answer: string;
  answerFrequency?: number;
  otherCluesForSameAnswer?: string[];
  definition?: string | null;
  mode?: 'inline' | 'sticky';
}) {
  const [revealNextSignal, setRevealNextSignal] = useState(0);
  const [revealAll, setRevealAll] = useState(false);

  const answerLen = (answer ?? '').replace(/[^A-Za-z]/g, '').length;
  const isSticky = mode === 'sticky';

  return (
    <>
      <div
        className={[
          'flex flex-wrap items-center justify-between gap-3',
          isSticky ? 'py-0.5' : 'mt-4',
        ].join(' ')}
      >
        <LetterTilesReveal
          answer={answer}
          revealAll={revealAll}
          revealNextSignal={revealNextSignal}
        />

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              track('reveal_next_letter', {
                context: 'clue',
                answer_len: answerLen,
              });
              setRevealNextSignal((n) => n + 1);
            }}
            className="btn-marigold-hover btn-press rounded-md border px-3 py-2 text-sm font-semibold"
          >
            Reveal next
          </button>

          <button
            type="button"
            onClick={() => {
              track('reveal_all_letters', {
                context: 'clue',
                answer_len: answerLen,
              });
              setRevealAll(true);
            }}
            disabled={revealAll}
            className={[
              'btn-press rounded-md border px-3 py-2 text-sm font-semibold',
              revealAll
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'btn-marigold-hover bg-white text-slate-700',
            ].join(' ')}
          >
            Reveal all
          </button>
        </div>
      </div>

      {/* Only show hints in inline mode */}
      {mode === 'inline' && (
        <HintsSection
          clueText={clueText}
          answer={answer}
          answerFrequency={answerFrequency}
          otherCluesForSameAnswer={otherCluesForSameAnswer}
          definition={definition}
        />
      )}
    </>
  );
}
