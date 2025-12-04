// app/search/SearchClient.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import { ResultItem } from '@/components/ResultItem';

function isAbortError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'name' in e &&
    (e as { name?: string }).name === 'AbortError'
  );
}

type Row = {
  id: number | string;
  clue: string;
  answer: string;
  source: string;
  date?: string | null;
  confidence?: number | null;
};

type Status = 'idle' | 'loading' | 'success' | 'error';

type View = {
  term: string;
  rows: Row[];
  count: number;
};

export default function SearchClient({
  initialQuery,
  initialResults,
  initialCount,
}: {
  initialQuery: string;
  initialResults: Row[];
  initialCount: number;
}) {
  const params = useSearchParams();

  const [view, setView] = useState<View>({
    term: initialQuery || '',
    rows: initialResults ?? [],
    count: initialCount ?? 0,
  });
  const [query, setQuery] = useState(initialQuery || '');

  const [status, setStatus] = useState<Status>(() => {
    if (!initialQuery) return 'idle';
    return (initialResults?.length ?? 0) > 0 ? 'success' : 'loading';
  });

  const versionRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  async function runFetch(q: string) {
    const v = ++versionRef.current;

    // ensure we are visibly loading *before* any paint
    setStatus('loading');

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        cache: 'no-store',
        signal: ctrl.signal,
      });
      if (!res.ok) {
        if (versionRef.current === v) setStatus('error');
        return;
      }
      const json = await res.json();
      if (versionRef.current !== v) return; // stale response

      const rows: Row[] = json.results ?? [];
      const count: number = json.count ?? rows.length;

      // Commit term + count + rows atomically to avoid UI desync
      setView({ term: q, rows, count });
      setStatus('success');
    } catch (e: unknown) {
      if (isAbortError(e)) return;
      if (versionRef.current === v) setStatus('error');
    }
  }

  // If we arrived with a query but SSR gave no rows, fetch on mount
  useEffect(() => {
    if (initialQuery && !(initialResults?.length > 0)) {
      setStatus('loading'); // <<< ensure no “0 results” flash
      runFetch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to URL changes (?q=…)
  useEffect(() => {
    const qParam = (params.get('q') ?? '').trim();
    if (qParam === query) return;

    setQuery(qParam);

    if (!qParam) {
      ++versionRef.current;
      abortRef.current?.abort();
      setView({ term: '', rows: [], count: 0 });
      setStatus('idle');
      return;
    }

    setStatus('loading'); // <<< flip to loading immediately
    runFetch(qParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const isLoading = status === 'loading';
  const showHint = status === 'idle' && !view.term;
  const showZero = status === 'success' && view.term && view.rows.length === 0;

  return (
    <div className="space-y-3 text-center">
      <SearchBar initialQuery={query} />

      <p className="text-brand-slate-600 text-sm">
        {showHint ? (
          <>
            Type a clue or an answer pattern like <code>D?NIM</code> and press
            search.
          </>
        ) : isLoading ? (
          <>Searching…</>
        ) : status === 'error' ? (
          <>Something went wrong. Please try again.</>
        ) : (
          <>
            Showing {view.count} result{view.count === 1 ? '' : 's'} for{' '}
            <strong>“{view.term}”</strong>{' '}
            {/[?*]/.test(view.term)
              ? '(pattern matched on answer)'
              : '(matched on clue or answer)'}
            .
          </>
        )}
      </p>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-card border-brand-slate-200 rounded-xl border p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="skeleton-line h-4 w-3/4" />
                  <div className="skeleton-line h-3 w-1/3" />
                </div>
                <div className="skeleton-line h-6 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className="mt-6 space-y-3">
          {showZero ? (
            <div className="text-brand-slate-600 text-sm">
              No results found. Try:
              <ul className="mt-2 list-disc pl-5 text-left">
                <li>Fewer words (e.g., “capital of Peru” → “Peru capital”)</li>
                <li>
                  Pattern search with <code>?</code> or <code>*</code> (e.g.,{' '}
                  <code>D?NIM</code>)
                </li>
              </ul>
            </div>
          ) : (
            view.rows.map((r) => (
              <ResultItem
                key={r.id}
                clue={r.clue}
                answer={r.answer}
                source={r.source}
                date={r.date ?? undefined}
                confidence={r.confidence ?? undefined}
              />
            ))
          )}
        </section>
      )}

      {status === 'success' && view.term && view.rows.length > 0 && (
        <p className="text-brand-slate-500 pt-2 text-xs">
          {view.count} result{view.count === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}
