// components/RevealAnswer.tsx
'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';

type RevealAnswerProps = {
  answer: string;
  size?: 'sm' | 'md' | 'lg';
  startRevealed?: boolean;
  version?: number;
  maskLength?: number;
  eventProps?: Record<string, string | number | boolean>;
};

export function RevealAnswer({
  answer,
  size = 'md',
  startRevealed = false,
  version,
  maskLength,
  eventProps,
}: RevealAnswerProps) {
  const [revealed, setRevealed] = useState(startRevealed);

  useEffect(() => {
    setRevealed(startRevealed);
  }, [startRevealed, version]);

  const cleanedLen = (answer ?? '').replace(/[^A-Za-z]/g, '').length;

  // If maskLength is provided, use it exactly (min 1).
  // Otherwise fall back to cleanedLen, then 3.
  const dotsLen =
    typeof maskLength === 'number'
      ? Math.max(maskLength, 1)
      : Math.max(cleanedLen || 3, 3);

  const placeholderDots = '•'.repeat(dotsLen);

  let textSize = 'text-base';
  if (size === 'sm') textSize = 'text-sm';
  if (size === 'lg') textSize = 'text-xl';

  return (
    <button
      type="button"
      onClick={() => {
        const next = !revealed;

        track('reveal_answer_toggle', {
          to: next ? 'shown' : 'hidden',
          answer_len: cleanedLen,
          ...eventProps,
        });

        setRevealed(next);
      }}
      className={`btn-marigold-hover btn-press inline-flex items-center justify-center rounded-md border px-3 py-1 font-mono uppercase tracking-[0.07em] ${textSize}`}
      aria-pressed={revealed}
      aria-label={revealed ? 'Hide answer' : 'Show answer'}
    >
      {revealed ? answer || '—' : placeholderDots}
    </button>
  );
}
