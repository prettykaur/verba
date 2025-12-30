'use client';

import { useEffect, useMemo, useState } from 'react';
import { track } from '@/lib/analytics';

export function LetterTilesReveal({
  answer,
  revealAll = false,
  revealNextSignal = 0,
  className = '',
}: {
  answer: string;
  revealAll?: boolean;
  revealNextSignal?: number;
  className?: string;
}) {
  const letters = useMemo(
    () => (answer ?? '').replace(/[^A-Za-z]/g, '').split(''),
    [answer],
  );

  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    setRevealed(new Set());
  }, [answer]);

  useEffect(() => {
    if (!revealAll) return;
    setRevealed(new Set(letters.map((_, i) => i)));
  }, [revealAll, letters]);

  useEffect(() => {
    if (!letters.length) return;
    if (!revealNextSignal || revealNextSignal <= 0) return;

    setRevealed((prev) => {
      const nextIdx = letters.findIndex((_, i) => !prev.has(i));
      if (nextIdx === -1) return prev;

      track('reveal_letter_tile', {
        method: 'reveal_next',
        idx: nextIdx + 1,
        total: letters.length,
      });

      const next = new Set(prev);
      next.add(nextIdx);
      return next;
    });
  }, [revealNextSignal, letters]);

  if (letters.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {letters.map((letter, i) => {
          const isRevealed = revealed.has(i);

          return (
            <button
              key={i}
              type="button"
              onClick={() =>
                setRevealed((prev) => {
                  if (prev.has(i)) return prev;

                  track('reveal_letter_tile', {
                    method: 'tile_click',
                    idx: i + 1,
                    total: letters.length,
                  });

                  const next = new Set(prev);
                  next.add(i);
                  return next;
                })
              }
              className={[
                'btn-press flex h-10 w-10 select-none items-center justify-center rounded-md border text-sm font-semibold shadow-sm transition',
                isRevealed
                  ? 'border-slate-400 bg-slate-100 text-slate-900'
                  : 'btn-marigold-hover border-slate-200 bg-white text-slate-400',
              ].join(' ')}
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
        Tap a tile to reveal a letter
      </p>
    </div>
  );
}
