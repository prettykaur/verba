// components/SearchResults.client.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { ResultItem } from '@/components/ResultItem';
import type { ComponentProps } from 'react';

// ResultItem props (excluding query)
type ResultItemProps = ComponentProps<typeof ResultItem>;
type ResultItemData = Omit<ResultItemProps, 'query'>;

type SearchResult = ResultItemData & {
  occurrenceId: number;
};

// API response shape
type SearchApiResult = Partial<SearchResult> & {
  occurrenceId?: number | string;
};

type SearchApiResponse = {
  results?: SearchApiResult[];
};

function RowSkeleton() {
  return (
    <div className="skeleton-card border-brand-slate-200 border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="skeleton-line h-4 w-3/4" />
          <div className="skeleton-line h-3 w-1/3" />
        </div>
        <div className="skeleton-line h-6 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function SearchResults({
  q,
  initialResults,
}: {
  q: string;
  initialResults: SearchResult[];
}) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>(initialResults);

  // Scroll anchor
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q) {
      setResults(initialResults);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json() as Promise<SearchApiResponse>)
      .then((data) => {
        if (cancelled) return;

        const normalized: SearchResult[] = (data.results ?? [])
          .map((r) => {
            const occurrenceId = Number(r.occurrenceId);
            if (!Number.isFinite(occurrenceId)) return null;

            return {
              ...(r as ResultItemData),
              clueSlug: r.clueSlug ?? '',
              occurrenceId,
            };
          })
          .filter(Boolean) as SearchResult[];

        setResults(normalized);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, initialResults]);

  // Scroll when results appear
  useEffect(() => {
    if (!loading && results.length > 0) {
      resultsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [loading, results.length]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div ref={resultsRef} className="space-y-3">
      {results.map((r) => (
        <ResultItem key={`result-${r.occurrenceId}`} {...r} query={q} />
      ))}
    </div>
  );
}
