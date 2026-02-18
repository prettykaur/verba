// app/answers/[source]/archive/[year]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSourceDisplay } from '@/lib/sourceDisplay';
import { formatPuzzleDateShort } from '@/lib/formatDate';
import { Metadata } from 'next';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ source: string; year: string }>;
};

function monthName(year: number, month: string) {
  const d = new Date(`${year}-${month}-01T00:00:00Z`);
  return d.toLocaleString('en-US', { month: 'long' });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { source, year } = await params;
  const sourceName = getSourceDisplay(source);

  const url = `https://tryverba.com/answers/${source}/archive/${year}`;

  return {
    title: `${sourceName} Crossword Archive – ${year}`,
    description: `Browse all ${sourceName} crossword puzzles published in ${year}.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${sourceName} Crossword Archive – ${year}`,
      description: `All ${sourceName} crossword puzzles from ${year}.`,
      url,
      type: 'website',
    },
  };
}

export default async function YearArchivePage({
  params,
}: {
  params: Promise<{ source: string; year: string }>;
}) {
  const { source, year } = await params;

  if (!/^\d{4}$/.test(year)) notFound();

  const sourceName = getSourceDisplay(source);

  const { data, error } = await supabase
    .from('v_archive_months')
    .select('month, day_count, lastmod')
    .eq('source_slug', source)
    .eq('year', Number(year))
    .order('month', { ascending: false });

  if (error || !data?.length) {
    console.error(error);
    notFound();
  }

  const totalDays = data.reduce((sum, r) => sum + r.day_count, 0);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://tryverba.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: sourceName,
        item: `https://tryverba.com/answers/${source}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Archive',
        item: `https://tryverba.com/answers/${source}/archive`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: year,
        item: `https://tryverba.com/answers/${source}/archive/${year}`,
      },
    ],
  };

  return (
    <div className="max-w-5xl space-y-8">
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <Link href="/" className="verba-link text-verba-blue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/answers/${source}`}
          className="verba-link text-verba-blue"
        >
          {sourceName}
        </Link>
        <span className="mx-1">/</span>
        <Link
          href={`/answers/${source}/archive`}
          className="verba-link text-verba-blue"
        >
          Archive
        </Link>
        <span className="mx-1">/</span>
        <span>{year}</span>
      </nav>

      <h1 className="text-3xl font-bold">
        {sourceName} Crossword Archive – {year}
      </h1>

      <p className="max-w-3xl text-slate-600">
        This archive includes all <strong>{totalDays}</strong>{' '}
        <Link
          href={`/answers/${source}`}
          className="verba-link text-verba-blue"
        >
          {sourceName}
        </Link>{' '}
        crossword puzzles published in {year}, organized by month. Select a
        month below to browse daily answers.
      </p>

      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {data.map((row) => (
          <li key={row.month}>
            <Link
              href={`/answers/${source}/archive/${year}/${row.month}`}
              className="card-hover-marigold btn-press block rounded-lg border bg-white px-10 py-3"
            >
              <div className="space-y-2 text-center">
                <span className="verba-link inline-block font-semibold text-verba-blue">
                  {monthName(Number(year), row.month)} {year}
                </span>
                <div className="text-xs text-slate-500">
                  {row.day_count} puzzles
                </div>
                <div className="text-xs text-slate-500">
                  Updated{' '}
                  {formatPuzzleDateShort(String(row.lastmod).slice(0, 10))}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div>
        <Link
          href={`/answers/${source}/archive`}
          className="verba-link text-verba-blue"
        >
          ← Back to all years
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb),
        }}
      />
    </div>
  );
}
