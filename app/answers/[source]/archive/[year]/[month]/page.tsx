// app/answers/[source]/archive/[year]/[month]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateShort } from '@/lib/formatDate';
import { getSourceDisplay } from '@/lib/sourceDisplay';
import { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ source: string; year: string; month: string }>;
}): Promise<Metadata> {
  const { source, year, month } = await params;
  const sourceName = getSourceDisplay(source);

  const monthLabel = new Date(`${year}-${month}-01T00:00:00Z`).toLocaleString(
    'en-US',
    { month: 'long' },
  );

  const url = `https://tryverba.com/answers/${source}/archive/${year}/${month}`;

  return {
    title: `${sourceName} Crossword Archive – ${monthLabel} ${year}`,
    description: `Browse all ${sourceName} crossword puzzles published in ${monthLabel} ${year}.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${sourceName} Crossword Archive – ${monthLabel} ${year}`,
      description: `All ${sourceName} crossword puzzles from ${monthLabel} ${year}.`,
      url,
      type: 'website',
    },
  };
}

export default async function MonthArchivePage({
  params,
}: {
  params: Promise<{ source: string; year: string; month: string }>;
}) {
  const { source, year, month } = await params;

  if (!/^\d{4}$/.test(year) || !/^(0[1-9]|1[0-2])$/.test(month)) notFound();

  const sourceName = getSourceDisplay(source);

  const start = `${year}-${month}-01`;

  const nextMonth =
    month === '12'
      ? `${Number(year) + 1}-01-01`
      : `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('puzzle_day')
    .select('puzzle_date, puzzle_source!inner(slug)')
    .eq('puzzle_source.slug', source)
    .gte('puzzle_date', start)
    .lt('puzzle_date', nextMonth)
    .order('puzzle_date', { ascending: false });

  if (error || !data?.length) {
    console.error(error);
    notFound();
  }

  const dates = Array.from(new Set(data.map((r) => r.puzzle_date))).sort(
    (a, b) => b.localeCompare(a),
  );

  const monthLabel = new Date(`${year}-${month}-01T00:00:00Z`).toLocaleString(
    'en-US',
    { month: 'long' },
  );

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
      {
        '@type': 'ListItem',
        position: 5,
        name: `${monthLabel} ${year}`,
        item: `https://tryverba.com/answers/${source}/archive/${year}/${month}`,
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
        <Link
          href={`/answers/${source}/archive/${year}`}
          className="verba-link text-verba-blue"
        >
          {year}
        </Link>
        <span className="mx-1">/</span>
        <span>
          {monthLabel} {year}
        </span>
      </nav>

      <h1 className="text-3xl font-bold">
        {sourceName} Crossword Archive – {monthLabel} {year}
      </h1>

      <p className="max-w-3xl text-slate-600">
        Browse all <strong>{dates.length}</strong> daily{' '}
        <Link
          href={`/answers/${source}`}
          className="verba-link text-verba-blue"
        >
          {sourceName}
        </Link>{' '}
        {`crossword puzzles published in ${monthLabel} ${year} below. Click a date to view that puzzle’s full solution.`}
      </p>

      <ul className="grid gap-4 text-sm sm:grid-cols-2 md:grid-cols-3">
        {dates.map((d) => (
          <li key={d}>
            <Link
              href={`/answers/${source}/${d}`}
              className="btn-marigold-hover btn-press block rounded-lg border bg-white px-3 py-2 text-center"
            >
              {formatPuzzleDateShort(d)}
            </Link>
          </li>
        ))}
      </ul>

      <div>
        <Link
          href={`/answers/${source}/archive/${year}`}
          className="verba-link text-verba-blue"
        >
          ← Back to {year}
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
