// components/SearchResults.client.tsx

'use client';

import { useEffect, useState } from 'react';
import { ResultItem } from '@/components/ResultItem';
import type { ComponentProps } from 'react';

// ResultItem props (excluding query)
type ResultItemProps = ComponentProps<typeof ResultItem>;
type ResultItemData = Omit<ResultItemProps, 'query'>;

// Data shape coming from the API
type SearchResult = ResultItemData & {
  occurrenceId: number;
};

function RowSkeleton() {
  return (
    <div className="skeleton-card border-brand-slate-200 border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="skeleton-line h-4 w-3/4"></div>
          <div className="skeleton-line h-3 w-1/3"></div>
        </div>
        <div className="skeleton-line h-6 w-24 rounded-md"></div>
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

  useEffect(() => {
    if (!q) {
      setResults(initialResults);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;

        const normalized: SearchResult[] = (data.results ?? []).map(
          (r: any) => ({
            ...r,
            occurrenceId: Number(r.occurrenceId),
          }),
        );

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
    <>
      {results.map((r) => (
        <ResultItem key={`result-${r.occurrenceId}`} {...r} query={q} />
      ))}
    </>
  );
}
