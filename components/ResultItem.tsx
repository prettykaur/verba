// components/ResultItem.tsx
export function ResultItem({
  clue,
  answer,
  source,
  date,
  confidence,
}: {
  clue: string;
  answer: string;
  source: string;
  date?: string;
  confidence?: number | null;
}) {
  return (
    <div className="border-brand-slate-200 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Left: clue + meta */}
        <div className="min-w-0">
          {/* Bigger, editorial headline feel. Uses your .result-clue font */}
          <div className="result-clue text-brand-slate-900 truncate text-[1.1875rem] font-semibold leading-snug tracking-tight sm:text-[1.25rem] md:text-[1.375rem]">
            {clue}
          </div>

          {/* Meta row */}
          <div className="text-brand-slate-600 mt-1 flex items-center gap-1 text-sm">
            {source && <span className="shrink-0">{source}</span>}
            {source && date && <span aria-hidden>·</span>}
            {date && (
              <time className="shrink-0" dateTime={date}>
                {date}
              </time>
            )}
          </div>
        </div>

        {/* Right: answer */}
        <div
          // Smaller text:
          // className="text-brand-slate-900 shrink-0 select-text whitespace-nowrap rounded-md px-2 py-1 text-right font-mono text-xl uppercase leading-none tracking-[0.08em] sm:text-2xl"
          // Larger text:
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
