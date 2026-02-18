// app/answers/[source]/archive/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSourceDisplay } from '@/lib/sourceDisplay';
import { formatPuzzleDateShort } from '@/lib/formatDate';
import { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ source: string }>;
}): Promise<Metadata> {
  const { source } = await params;
  const sourceName = getSourceDisplay(source);

  const url = `https://tryverba.com/answers/${source}/archive`;

  return {
    title: `${sourceName} Crossword Archive`,
    description: `Browse all archived ${sourceName} crossword puzzles by year.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${sourceName} Crossword Archive`,
      description: `All archived ${sourceName} crossword puzzles organized by year.`,
      url,
      type: 'website',
    },
  };
}

export default async function ArchiveIndexPage({
  params,
}: {
  params: Promise<{ source: string }>;
}) {
  const { source } = await params;
  const sourceName = getSourceDisplay(source);

  const { data, error } = await supabase
    .from('v_archive_years')
    .select('year, day_count, lastmod')
    .eq('source_slug', source)
    .order('year', { ascending: false });

  if (error || !data?.length) {
    console.error(error);
    notFound();
  }

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
        <span>Archive</span>
      </nav>

      <h1 className="text-3xl font-bold">{sourceName} Crossword Archive</h1>

      <p className="text-slate-600">
        The{' '}
        <Link
          href={`/answers/${source}`}
          className="verba-link text-verba-blue"
        >
          {sourceName}
        </Link>{' '}
        Crossword archive contains every published puzzle, organized by year.
        Use the links below to explore past puzzles, revisit missed days, or
        review older crossword answers.
      </p>

      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {data.map((row) => (
          <li key={row.year}>
            <Link
              href={`/answers/${source}/archive/${row.year}`}
              className="card-hover-marigold btn-press block rounded-lg border bg-white px-4 py-3"
            >
              <div className="space-y-2 text-center">
                <span className="verba-link inline-block font-semibold text-verba-blue">
                  {row.year}
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb),
        }}
      />
    </div>
  );
}
