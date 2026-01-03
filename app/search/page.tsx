// app/search/page.tsx
import { headers } from 'next/headers';
import { SearchBar } from '@/components/SearchBar';
// import { ResultItem } from '@/components/ResultItem';
import { SearchHint } from '@/components/SearchHint';
import { SearchResults } from '@/components/SearchResults.client';

type Row = {
  occurrenceId: number;
  id: number | string;
  clue: string;
  answer: string;
  source: string;
  sourceSlug?: string | null;
  date?: string | null;
  number?: number | null;
  direction?: 'across' | 'down' | null;
  confidence?: number | null;
};

function buildBaseUrl(h: Headers): string {
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

async function getResults(q: string) {
  if (!q) return { results: [] as Row[], count: 0 };
  const h = await headers();
  const base = buildBaseUrl(h);
  const res = await fetch(`${base}/api/search?q=${encodeURIComponent(q)}`, {
    cache: 'no-store',
  });
  if (!res.ok) return { results: [] as Row[], count: 0 };
  return res.json();
}

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp?.q ?? '').trim();
  const { results = [], count = 0 } = await getResults(q);

  return (
    <>
      <div className="space-y-3 text-center">
        <h1 className="text-2xl font-bold">Search Results</h1>
        <SearchBar initialQuery={q} />
        <SearchHint q={q} count={count} />
      </div>

      <section id="results" className="mt-6 space-y-3">
        <SearchResults q={q} initialResults={results} />
      </section>
    </>
  );
}
