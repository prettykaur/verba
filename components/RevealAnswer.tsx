// components/RevealAnswer.tsx
'use client';

import { useEffect, useState } from 'react';

type RevealAnswerProps = {
  answer: string;
  size?: 'sm' | 'md' | 'lg';
  /** When this changes, the component will reset to this visibility state */
  startRevealed?: boolean;
  version?: number;

  /** Optional: force the placeholder dot length (e.g. 2-letter answers => "••") */
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

  const length = (answer ?? '').replace(/[^A-Za-z]/g, '').length;

  // If maskLength is provided, use it EXACTLY (fixes 2-letter => 2 dots).
  // Otherwise keep existing behavior (min 3 dots).
  const dotsCount =
    typeof maskLength === 'number' && maskLength > 0
      ? maskLength
      : Math.max(length || 3, 3);

  const placeholderDots = '•'.repeat(dotsCount);

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
