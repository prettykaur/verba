// components/ClueHintActions.client.tsx

'use client';

import { useState, useEffect } from 'react';
import { HintsSection } from '@/components/HintsSection';
import { LetterTilesReveal } from '@/components/LetterTilesReveal';
import { track } from '@/lib/analytics';

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
  const [copied, setCopied] = useState(false);

  const cleaned = (answer ?? '').replace(/[^A-Za-z]/g, '');
  const answerLen = cleaned.length;

  const fullyRevealed = revealAll || revealNextSignal >= answerLen;

  useEffect(() => {
    if (!fullyRevealed) setCopied(false);
  }, [fullyRevealed]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);

      track('copy_answer', {
        context: 'clue',
        answer_len: answerLen,
      });

      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      const el = document.createElement('textarea');
      el.value = answer;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <LetterTilesReveal
          answer={answer}
          revealAll={revealAll}
          revealNextSignal={revealNextSignal}
        />

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              track('reveal_next_letter', {
                context: 'clue',
                answer_len: answerLen,
              });
              setRevealNextSignal((n) => n + 1);
            }}
            disabled={fullyRevealed}
            className="btn-marigold-hover btn-press inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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
            disabled={fullyRevealed}
            className="btn-marigold-hover btn-press inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            Reveal all
          </button>

          {fullyRevealed && (
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              aria-live="polite"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
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
