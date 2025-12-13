// components/ResultItem.tsx
import Link from 'next/link';
import { Highlight } from './Highlight';
import { formatPuzzleDateLong } from '@/lib/formatDate';

export function ResultItem({
  occurrenceId,
  clue,
  answer,
  source,
  sourceSlug,
  date,
  number,
  direction,
  confidence,
  query,
}: {
  occurrenceId: number;
  clue: string;
  answer: string; // used only for length hint, not rendered
  source: string; // human-readable label e.g. "NYT Mini"
  sourceSlug?: string; // URL slug e.g. "nyt-mini"
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

  // derive a clean letter count (A–Z only)
  const clean = (answer ?? '').replace(/[^A-Za-z]/g, '');
  const letterCount = clean.length;
  const lettersLabel =
    letterCount > 0
      ? `${letterCount} letter${letterCount === 1 ? '' : 's'}`
      : null;

  // best-effort slug fallback if not explicitly passed
  const slug =
    sourceSlug ??
    source
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-') // collapse non-alphanumerics
      .replace(/^-+|-+$/g, ''); // trim hyphens

  // anchor must match the IDs on the daily answers page
  const clueAnchor =
    number && direction ? `${number}-${direction.toLowerCase()}` : undefined;

  // links for source index + daily page
  const sourceHref = slug ? `/answers/${encodeURIComponent(slug)}` : undefined;

  const dateHref =
    slug && date
      ? `/answers/${encodeURIComponent(slug)}/${encodeURIComponent(date)}${
          clueAnchor ? `#${clueAnchor}` : ''
        }`
      : undefined;

  const clueHref = `/clue/${encodeURIComponent(String(occurrenceId))}`;

  return (
    <div className="card-hover-marigold card-lift border-brand-slate-200 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Left: clue + meta */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <Link href={clueHref} className="verba-link block no-underline">
            <div className="result-clue text-brand-slate-900 truncate text-[1.1875rem] font-semibold leading-snug tracking-tight sm:text-[1.25rem] md:text-[1.375rem]">
              <Highlight text={clue} query={query ?? ''} />
            </div>
          </Link>

          {/* Meta row */}
          <div className="text-brand-slate-600 mt-1 flex flex-wrap items-center gap-1 text-sm">
            {positionLabel && <span className="shrink-0">{positionLabel}</span>}
            {positionLabel && lettersLabel && <span aria-hidden>·</span>}
            {lettersLabel && <span className="shrink-0">{lettersLabel}</span>}
            {(positionLabel || lettersLabel) && source && (
              <span aria-hidden>·</span>
            )}

            {source &&
              (sourceHref ? (
                <Link
                  href={sourceHref}
                  className="verba-link shrink-0 text-verba-blue"
                >
                  {source}
                </Link>
              ) : (
                <span className="shrink-0">{source}</span>
              ))}

            {source && date && <span aria-hidden>·</span>}

            {date &&
              (dateHref ? (
                <Link
                  href={dateHref}
                  className="verba-link shrink-0 text-verba-blue"
                >
                  <time dateTime={date}>{formatPuzzleDateLong(date)}</time>
                </Link>
              ) : (
                <time className="shrink-0" dateTime={date}>
                  {formatPuzzleDateLong(date)}
                </time>
              ))}
          </div>
        </div>

        {/* Right: go to individual clue page */}
        <Link
          href={clueHref}
          className="verba-link shrink-0 whitespace-nowrap text-sm text-verba-blue"
        >
          View answer →
        </Link>
      </div>

      {typeof confidence === 'number' && (
        <div className="text-brand-slate-400 mt-2 text-right text-[10px]">
          conf: {confidence.toFixed(2)}
        </div>
      )}
    </div>
  );
}
