// components/RevealAnswer.tsx
'use client';

import { useState } from 'react';

type RevealAnswerProps = {
  answer: string;
  size?: 'sm' | 'lg';
};

export function RevealAnswer({ answer, size = 'sm' }: RevealAnswerProps) {
  const [revealed, setRevealed] = useState(false);

  const trimmed = (answer ?? '').trim();
  if (!trimmed) {
    return <span className="text-slate-400">—</span>;
  }

  // Slightly different sizing for search cards vs daily page
  const answerSizeClass = size === 'lg' ? 'text-2xl' : 'text-lg';

  const buttonPadding =
    size === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-[11px]';

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setRevealed((prev) => !prev)}
        className={`btn-marigold-hover btn-press rounded-md border font-medium text-slate-800 ${buttonPadding}`}
      >
        {revealed ? 'Hide answer' : 'Show answer'}
      </button>

      {revealed && (
        <span className={`font-semibold tracking-wide ${answerSizeClass}`}>
          {trimmed}
        </span>
      )}
    </div>
  );
}
