// components/HintsSection.tsx
'use client';

import { useMemo, useState } from 'react';

type HintsSectionProps = {
  clueText: string;
  answer: string;
  answerFrequency?: number;
  otherCluesForSameAnswer?: string[];
  definition?: string | null;
};

function cleanAnswer(s: string) {
  return (s ?? '').replace(/[^A-Za-z]/g, '').toUpperCase();
}

function toTitleCase(label: string) {
  const special: Record<string, string> = {
    us: 'U.S.',
    usa: 'U.S.A.',
    uk: 'U.K.',
    eu: 'E.U.',
    nba: 'NBA',
    nfl: 'NFL',
    nyt: 'NYT',
  };
  const key = label.trim().toLowerCase();
  if (special[key]) return special[key];
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function topClueWords(clueText: string, max = 3) {
  const stop = new Set([
    'a',
    'an',
    'the',
    'of',
    'to',
    'in',
    'on',
    'at',
    'for',
    'and',
    'or',
    'with',
    'from',
    'by',
    'as',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'this',
    'that',
    'these',
    'those',
    'it',
    'its',
    'one',
    'two',
    'three',
    'some',
    'any',
  ]);

  const words = (clueText ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => !stop.has(w))
    .filter((w) => w.length >= 4);

  const uniq = Array.from(new Set(words));
  uniq.sort((a, b) => b.length - a.length);
  return uniq.slice(0, max);
}

type Hint = { label: string; body: string };

export function HintsSection({
  clueText,
  answer,
  answerFrequency,
  otherCluesForSameAnswer,
  definition,
}: HintsSectionProps) {
  const clean = cleanAnswer(answer);
  const len = clean.length;

  // Progressive unlock count (Hint 1 available by default)
  const [unlockedCount, setUnlockedCount] = useState(1);

  // Revealed hints (by number)
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  // Which hint’s content is currently shown
  const [activeHint, setActiveHint] = useState<number | null>(null);

  const keywords = useMemo(() => topClueWords(clueText, 3), [clueText]);

  const hints = useMemo((): Hint[] => {
    const items: Hint[] = [];

    // Hint 1: Pattern
    if (len > 0) {
      items.push({
        label: 'Pattern',
        body: `Pattern: ${'_ '.repeat(len).trim()}`,
      });
    }

    // Hint 2: Answer type
    const structure: string[] = [];
    if (/ /.test(answer)) structure.push('multi-word phrase');
    if (/-/.test(answer)) structure.push('hyphenated');
    if (answer.toUpperCase() === answer && len > 0 && len <= 5)
      structure.push('abbreviation');
    if (/s$/i.test(clean)) structure.push('plural');

    if (structure.length > 0) {
      items.push({
        label: 'Answer type',
        body: `Answer type: ${structure.map(toTitleCase).join(', ')}.`,
      });
    }

    // Hint 3: Clue mechanics
    const mechanics: string[] = [];
    if (/with\s+\d+/i.test(clueText))
      mechanics.push('This clue depends on another entry.');
    if (/e\.g\./i.test(clueText))
      mechanics.push('This clue is asking for an example.');
    if (/\?$/.test(clueText))
      mechanics.push('This clue likely involves wordplay.');

    if (mechanics.length > 0) {
      items.push({
        label: 'Clue mechanics',
        body: mechanics.join(' '),
      });
    }

    // Hint 4: Popularity (optional)
    if (typeof answerFrequency === 'number' && answerFrequency > 1) {
      let body = `Seen in ${answerFrequency} puzzles.`;

      if (otherCluesForSameAnswer?.length) {
        const brandish = otherCluesForSameAnswer.filter((t) =>
          /\b(brand|company|maker|chain|store|label|corp|inc|ltd)\b/i.test(t),
        ).length;

        if (brandish / otherCluesForSameAnswer.length >= 0.25) {
          body += ' Often clued as a brand or company.';
        }
      }

      items.push({
        label: 'Popularity',
        body,
      });
    }

    return items;
  }, [answer, clueText, len, clean, answerFrequency, otherCluesForSameAnswer]);

  if (hints.length === 0 && !keywords.length && !definition) return null;

  const totalHints = hints.length;

  return (
    <details className="card-hover-marigold mt-4 rounded-lg border bg-slate-50 p-4">
      <summary className="cursor-pointer select-none text-sm font-semibold text-slate-700">
        Hints
      </summary>

      <div className="mt-3">
        {/* Definition slot (placeholder for later) */}
        <div className="mb-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">Definition:</span>{' '}
          {definition ? (
            <span>{definition}</span>
          ) : (
            <span className="text-slate-400">Coming soon.</span>
          )}
        </div>

        {/* Hint buttons */}
        {totalHints > 0 && (
          <div className="flex flex-wrap gap-2">
            {hints.map((_, idx) => {
              const n = idx + 1;
              const unlocked = n <= unlockedCount;

              return (
                <button
                  key={n}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => {
                    if (!unlocked) return;

                    setRevealed((prev) => {
                      const next = new Set(prev);
                      next.add(n);
                      return next;
                    });

                    setActiveHint(n);
                    setUnlockedCount((c) => Math.max(c, n + 1));
                  }}
                  className={[
                    'btn-press rounded-md border px-3 py-2 text-sm font-semibold shadow-sm transition',
                    unlocked
                      ? 'btn-marigold-hover border-slate-200 bg-white text-slate-800'
                      : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400',
                  ].join(' ')}
                >
                  Hint {n}
                </button>
              );
            })}
          </div>
        )}

        {/* Keywords moved BELOW buttons, less dominant */}
        {keywords.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-500">Keywords</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {keywords.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Revealed hint panel */}
        {activeHint && revealed.has(activeHint) && hints[activeHint - 1] && (
          <div className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2">
            <div className="text-sm font-semibold text-slate-700">
              Hint {activeHint}: {hints[activeHint - 1].label}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              {hints[activeHint - 1].body}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
