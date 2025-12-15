// components/RevealAnswer.tsx
'use client';

import { useEffect, useState } from 'react';

type RevealAnswerProps = {
  answer: string;
  size?: 'sm' | 'md' | 'lg';
  /** When this changes, the component will reset to this visibility state */
  startRevealed?: boolean;
  version?: number;

  /** Optional: force the number of mask dots (useful when answer has punctuation/spaces) */
  maskLength?: number;
};

export function RevealAnswer({
  answer,
  size = 'md',
  startRevealed = false,
  version,
  maskLength,
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
      onClick={() => setRevealed((prev) => !prev)}
      className={`btn-marigold-hover btn-press inline-flex items-center justify-center rounded-md border px-3 py-1 font-mono uppercase tracking-[0.07em] ${textSize}`}
      aria-label={revealed ? 'Hide answer' : 'Show answer'}
    >
      {revealed ? answer || '—' : placeholderDots}
    </button>
  );
}
