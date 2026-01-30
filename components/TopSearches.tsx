// components/TopSearches.tsx

import Link from 'next/link';
import { getTopSearches } from '@/lib/getTopSearches';
import { Card, CardBody } from '@/components/ui/Card';

export async function TopSearches({
  title = 'Top Searches',
}: {
  title?: string;
}) {
  const searches = await getTopSearches(5);
  if (searches.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-brand-ink text-lg font-semibold">{title}</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {searches.map(({ query }) => (
          <Link
            key={query}
            href={`/search?q=${encodeURIComponent(query)}`}
            className="block"
          >
            <Card className="card-hover-marigold card-lift hover:border-brand-ink transition hover:shadow-sm">
              <CardBody className="text-brand-slate-700 text-center font-medium">
                <div className="text-sm font-medium text-slate-800">
                  {query}
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-400">
                  Search term
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
