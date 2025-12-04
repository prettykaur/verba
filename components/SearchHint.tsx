// components/SearchHint.tsx
'use client';

import { useEffect, useState } from 'react';

type SearchHintProps = {
  q: string;
  count: number;
};

export function SearchHint({ q, count }: SearchHintProps) {
  const [visible, setVisible] = useState(false);
  const hasPattern = /[?*]/.test(q);

  // Simple fade-in on query change
  useEffect(() => {
    setVisible(false);
    const id = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(id);
  }, [q, count]);

  const baseClasses =
    'mx-auto mt-2 flex max-w-xl items-start justify-center gap-2 text-sm text-brand-slate-600 transition-opacity duration-300 ' +
    (visible ? 'opacity-100' : 'opacity-0');

  if (!q) {
    return (
      <div className={baseClasses}>
        <span>
          Type a clue (e.g. <code>capital of Peru</code>) or an answer pattern
          (e.g. <code>D?NIM</code>).
        </span>
        <PatternHelpBadge />
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <span>
        Showing {count} result{count === 1 ? '' : 's'} for{' '}
        <strong>“{q}”</strong>{' '}
        {hasPattern ? (
          <span className="text-brand-slate-500 italic">
            (pattern search — matching answer letters only)
          </span>
        ) : (
          <span className="text-brand-slate-500 italic">
            (searching clues and answers)
          </span>
        )}
      </span>
      <PatternHelpBadge isPattern={hasPattern} />
    </div>
  );
}

function PatternHelpBadge({ isPattern }: { isPattern?: boolean }) {
  return (
    <div className="group relative inline-flex cursor-help items-center">
      {/* Question mark badge */}
      <span className="border-brand-slate-300 text-brand-slate-600 inline-flex h-5 w-5 items-center justify-center rounded-full border bg-white text-[11px] font-semibold shadow-sm">
        ?
      </span>

      {/* Tooltip */}
      <div className="border-brand-slate-200 text-brand-slate-700 pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-64 -translate-x-1/2 rounded-md border bg-white px-3 py-2 text-xs shadow-xl group-hover:block">
        <div className="mb-1 font-semibold">Pattern search tips</div>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <code>?</code> = exactly one letter &nbsp;(
            <code>SE?WEED</code> → <code>SEAWEED</code>)
          </li>
          <li>
            <code>*</code> = any letters (incl. none) &nbsp;(
            <code>ST*R</code> → <code>STAR</code>, <code>STIR</code>,{' '}
            <code>STROLLER</code>)
          </li>
          <li>
            {isPattern
              ? 'You’re currently in pattern mode: we match on the answer only.'
              : 'Use ? or * to switch into pattern mode when you know some letters.'}
          </li>
        </ul>
      </div>
    </div>
  );
}
