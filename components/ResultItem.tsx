// components/ResultItem.tsx
import { Highlight } from './Highlight';
import { formatPuzzleDateLong } from '@/lib/formatDate';

export function ResultItem({
  clue,
  answer,
  source,
  date,
  number,
  direction,
  confidence,
  query,
}: {
  clue: string;
  answer: string;
  source: string;
  date?: string;
  number?: number | null;
  direction?: 'across' | 'down' | null;
  confidence?: number | null;
  query?: string;
}) {
  const positionLabel =
    number && direction
      ? `${number} ${direction === 'across' ? 'Across' : 'Down'}`
      : null;

  return (
    <div className="border-brand-slate-200 card-hover-marigold card-lift rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Left: clue + meta */}
        <div className="min-w-0">
          {/* Bigger, editorial headline feel. Uses your .result-clue font */}
          <div className="result-clue text-brand-slate-900 truncate text-[1.1875rem] font-semibold leading-snug tracking-tight sm:text-[1.25rem] md:text-[1.375rem]">
            <Highlight text={clue} query={query ?? ''} />
          </div>

          {/* Meta row */}
          <div className="text-brand-slate-600 mt-1 flex items-center gap-1 text-sm">
            {positionLabel && <span className="shrink-0">{positionLabel}</span>}
            {positionLabel && source && <span aria-hidden>·</span>}

            {source && <span className="shrink-0">{source}</span>}
            {source && date && <span aria-hidden>·</span>}

            {date && (
              <time className="shrink-0" dateTime={date}>
                {formatPuzzleDateLong(date)}
              </time>
            )}
          </div>
        </div>

        {/* Right: answer */}
        <div
          className="text-brand-ink shrink-0 select-text rounded-md px-2 py-1 text-right font-mono text-2xl uppercase leading-none tracking-[0.07em]"
          title={answer}
        >
          {answer}
        </div>
      </div>

      {typeof confidence === 'number' && (
        <div className="text-brand-slate-400 mt-2 text-right text-[10px]">
          conf: {confidence.toFixed(2)}
        </div>
      )}
    </div>
  );
}
