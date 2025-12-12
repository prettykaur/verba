// components/RevealAnswer.tsx
'use client';

import { useEffect, useState } from 'react';

type RevealAnswerProps = {
  answer: string;
  size?: 'sm' | 'md' | 'lg';
  /** When this changes, the component will reset to this visibility state */
  startRevealed?: boolean;
  version?: number;
};

export function RevealAnswer({
  answer,
  size = 'md',
  startRevealed = false,
  version,
}: RevealAnswerProps) {
  const [revealed, setRevealed] = useState(startRevealed);

  // Whenever the parent toggles "reveal all / hide all" and bumps `version`,
  // sync our local state to `startRevealed`.
  useEffect(() => {
    setRevealed(startRevealed);
  }, [startRevealed, version]);

  const length = (answer ?? '').replace(/[^A-Za-z]/g, '').length;
  const placeholderDots = '•'.repeat(Math.max(length || 3, 3));

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
