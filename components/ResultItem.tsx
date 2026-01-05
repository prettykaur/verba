// components/ResultItem.tsx

'use client';

import Link from 'next/link';
import { Highlight } from './Highlight';
import { formatPuzzleDateLong } from '@/lib/formatDate';
import { track } from '@/lib/analytics';

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
  answer: string;
  source?: string;
  sourceSlug?: string;
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

  const clean = (answer ?? '').replace(/[^A-Za-z]/g, '');
  const letterCount = clean.length;
  const lettersLabel =
    letterCount > 0
      ? `${letterCount} letter${letterCount === 1 ? '' : 's'}`
      : null;

  const slug =
    sourceSlug ??
    (source
      ? source
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      : undefined);

  const clueAnchor =
    number && direction ? `${number}-${direction.toLowerCase()}` : undefined;

  const sourceHref = slug ? `/answers/${encodeURIComponent(slug)}` : undefined;

  const dateHref =
    slug && date
      ? `/answers/${encodeURIComponent(slug)}/${encodeURIComponent(date)}${
          clueAnchor ? `#${clueAnchor}` : ''
        }`
      : undefined;

  const clueHref = `/clue/${encodeURIComponent(String(occurrenceId))}`;

  const isSeed = slug === 'seed';

  const metaLink = 'verba-link text-verba-blue underline-offset-4';

  const handleResultClick = () => {
    track('result_click', {
      source: source ?? 'unknown',
      occurrenceId,
      query: query ?? '',
    });
  };

  return (
    <div className="card-hover-marigold card-lift border-brand-slate-200 rounded-2xl border bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 overflow-hidden">
          <Link
            href={clueHref}
            className="verba-link result-clue text-brand-slate-900 line-clamp-2 inline-block text-[1.05rem] font-semibold leading-snug tracking-tight sm:text-[1.25rem]"
            onClick={handleResultClick}
          >
            <Highlight text={clue} query={query ?? ''} />
          </Link>

          {/* meta row */}
          <div className="text-brand-slate-600 mt-1 flex flex-wrap items-center gap-1 text-sm">
            {positionLabel && <span>{positionLabel}</span>}
            {positionLabel && lettersLabel && <span aria-hidden>·</span>}
            {lettersLabel && <span>{lettersLabel}</span>}
            {(positionLabel || lettersLabel) && source && (
              <span aria-hidden>·</span>
            )}

            {source &&
              (sourceHref ? (
                <Link href={sourceHref} className={`${metaLink} shrink-0`}>
                  {source}
                </Link>
              ) : (
                <span>{source}</span>
              ))}

            {source && date && !isSeed && <span aria-hidden>·</span>}

            {date && dateHref && !isSeed && (
              <Link href={dateHref} className={`${metaLink} shrink-0`}>
                <time dateTime={date}>{formatPuzzleDateLong(date)}</time>
              </Link>
            )}
          </div>
        </div>

        <Link
          href={clueHref}
          className="verba-link shrink-0 whitespace-nowrap text-sm text-verba-blue"
          onClick={handleResultClick}
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
