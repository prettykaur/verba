// app/search/page.tsx
import { headers } from 'next/headers';
import { SearchBar } from '@/components/SearchBar';
import { ResultItem } from '@/components/ResultItem';
import { SearchHint } from '@/components/SearchHint';

type Row = {
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
  const hasPattern = /[?*]/.test(q);

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-bold">Search Results</h1>
          <SearchBar initialQuery={q} />
          <SearchHint q={q} count={count} />
        </div>

        <section id="results" className="mt-6 space-y-3">
          {q && results.length === 0 ? (
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
            results.map((r: Row) => (
              <ResultItem
                key={r.id}
                clue={r.clue}
                answer={r.answer}
                source={r.source}
                sourceSlug={r.sourceSlug ?? undefined}
                date={r.date ?? undefined}
                number={r.number ?? undefined}
                direction={r.direction ?? undefined}
                confidence={r.confidence ?? undefined}
                query={q}
              />
            ))
          )}
        </section>
      </main>
    </>
  );
}
