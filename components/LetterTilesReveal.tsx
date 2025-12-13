// components/LetterTilesReveal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

export function LetterTilesReveal({
  answer,
  revealAll = false,
}: {
  answer: string;
  revealAll?: boolean;
}) {
  // Keep only A–Z letters
  const letters = useMemo(
    () => answer.replace(/[^A-Za-z]/g, '').split(''),
    [answer],
  );

  // Track exactly which tile indices are revealed
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  // If parent says revealAll, reveal everything
  useEffect(() => {
    if (revealAll) {
      setRevealed(new Set(letters.map((_, i) => i)));
    }
  }, [revealAll, letters]);

  // If the answer changes (new clue), reset revealed state
  useEffect(() => {
    setRevealed(new Set());
  }, [answer]);

  if (letters.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {letters.map((letter, i) => {
          const isRevealed = revealed.has(i);

          return (
            <button
              key={i}
              type="button"
              onClick={() =>
                setRevealed((prev) => {
                  if (prev.has(i)) return prev; // don't toggle back
                  const next = new Set(prev);
                  next.add(i);
                  return next;
                })
              }
              className={`flex h-10 w-10 select-none items-center justify-center rounded-md border text-sm font-semibold shadow-sm transition ${
                isRevealed
                  ? 'border-slate-400 bg-slate-100 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
              }`}
              aria-label={
                isRevealed
                  ? `Letter ${i + 1} revealed`
                  : `Reveal letter ${i + 1}`
              }
            >
              {isRevealed ? letter.toUpperCase() : '?'}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Tap a tile to reveal that letter
      </p>
    </div>
  );
}
