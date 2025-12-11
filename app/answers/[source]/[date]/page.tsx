// app/answers/[source]/[date]/page.tsx
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';

export const dynamic = 'force-dynamic'; // remove `as const`
export const revalidate = 0;
export const dynamicParams = true;

// --- Static pre-render for 10 hero pages (keep dynamic fallback) ---
export function generateStaticParams() {
  return [
    { source: 'nyt-mini', date: '2025-10-12' },
    { source: 'nyt-mini', date: '2025-10-13' },
    { source: 'nyt-mini', date: '2025-10-14' },
    { source: 'nyt-mini', date: '2025-10-15' },
    { source: 'nyt-mini', date: '2025-10-16' },
    { source: 'nyt-mini', date: '2025-10-17' },
    { source: 'nyt-mini', date: '2025-10-18' },
    { source: 'nyt-mini', date: '2025-10-19' },
    { source: 'nyt-mini', date: '2025-10-20' },
    { source: 'nyt-mini', date: '2025-10-21' },
  ];
}

// Unique intro blurbs per hero page (SEO-friendly, avoids boilerplate)
const HERO_INTROS: Record<string, string> = {
  'nyt-mini/2025-10-12':
    'Quick answers for Sunday’s NYT Mini. Short grid, speedy solve.',
  'nyt-mini/2025-10-13':
    'Start the week strong—clean solutions for Monday’s NYT Mini.',
  'nyt-mini/2025-10-14':
    'Every clue explained for Tuesday’s NYT Mini in one tidy list.',
  'nyt-mini/2025-10-15':
    'Midweek Mini? Here are the answers, fast and spoiler-light.',
  'nyt-mini/2025-10-16':
    'All clues & entries for Thursday’s NYT Mini—swift reference.',
  'nyt-mini/2025-10-17':
    'Friday Mini solutions you can skim in seconds. No fluff.',
  'nyt-mini/2025-10-18':
    'Weekend warm-up: NYT Mini answers for a quick brain boost.',
  'nyt-mini/2025-10-19':
    'Sunday snack-size crossword—every answer at a glance.',
  'nyt-mini/2025-10-20':
    'Fresh week, fresh grid: Monday NYT Mini solutions below.',
  'nyt-mini/2025-10-21': 'Clear, concise answers for Tuesday’s NYT Mini. Done.',
};

const SOURCE_NAMES: Record<string, string> = {
  'nyt-mini': 'NYT Mini',
};

type Row = {
  occurrence_id: number;
  clue_text: string;
  answer: string | null;
  answer_pretty: string | null;
  number: number | null;
  direction: 'across' | 'down' | null;
  source_slug: string;
  source_name: string | null;
  puzzle_date: string; // 'YYYY-MM-DD'
};

// NOTE: params is a Promise in your setup — so type it that way and await it.
type PageParams = { params: Promise<{ source: string; date: string }> };

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const awaited = await params;
  const source = decodeURIComponent(awaited.source).trim().toLowerCase();

  // ISO for URLs / queries
  const isoDate = decodeURIComponent(awaited.date).trim().slice(0, 10);
  // Pretty date for humans
  const displayDate = formatPuzzleDateLong(isoDate);

  const sourceName = SOURCE_NAMES[source] ?? source;

  const title = `${sourceName} Crossword Answers — ${displayDate} | Verba`;
  const description = `All clues & solutions for ${sourceName} on ${displayDate}. Fast, clean answers powered by Verba.`;
  const url = `https://tryverba.com/answers/${encodeURIComponent(source)}/${encodeURIComponent(isoDate)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article', siteName: 'Verba' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function DailyAnswersPage({ params }: PageParams) {
  const awaited = await params;
  const source = decodeURIComponent(awaited.source).trim().toLowerCase();
  const isoDate = decodeURIComponent(awaited.date).trim().slice(0, 10);
  const displayDate = formatPuzzleDateLong(isoDate);

  const { data, error } = await supabase
    .from('v_search_results_pretty')
    .select(
      `
      occurrence_id,
      clue_text,
      answer,
      answer_pretty,
      number,
      direction,
      source_slug,
      source_name,
      puzzle_date
      `,
    )
    .eq('source_slug', source)
    .eq('puzzle_date', isoDate)
    .order('number', { ascending: true });

  if (error) console.error('Supabase @daily answers:', error);

  const rows = (data ?? []) as Row[];
  const sourceName = rows[0]?.source_name ?? SOURCE_NAMES[source] ?? source;
  // const dt = date;
  // keep raw ISO for keys, use pretty for display
  const heroKey = `${source}/${isoDate}`;

  const faqs =
    rows.length > 0
      ? rows.slice(0, 50).map((r) => ({
          '@type': 'Question',
          name: r.clue_text,
          acceptedAnswer: {
            '@type': 'Answer',
            text: (r.answer_pretty ?? r.answer ?? '').trim(),
          },
        }))
      : [];

  const jsonLdFaq =
    rows.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs,
        }
      : null;

  const jsonLdBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://tryverba.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Answers',
        item: 'https://tryverba.com/answers',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: sourceName,
        item: `https://tryverba.com/answers/${encodeURIComponent(source)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: displayDate,
        item: `https://tryverba.com/answers/${encodeURIComponent(source)}/${encodeURIComponent(isoDate)}`,
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      {jsonLdFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      )}

      {/* Article JSON-LD only when there is data */}
      {rows.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: `${sourceName} Crossword Answers — ${displayDate}`,
              description: `All clues & solutions for ${sourceName} on ${displayDate}.`,
              url: `https://tryverba.com/answers/${encodeURIComponent(source)}/${encodeURIComponent(isoDate)}`,
              datePublished: isoDate,
              dateModified: isoDate,
              author: { '@type': 'Organization', name: 'Verba' },
              publisher: {
                '@type': 'Organization',
                name: 'Verba',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://tryverba.com/icon.png',
                },
              },
            }),
          }}
        />
      )}

      <h1 className="text-2xl font-bold">
        {sourceName} — Answers for {displayDate}
      </h1>
      <p className="mt-2 text-slate-600">
        {HERO_INTROS[heroKey] ??
          `All clues & solutions for ${sourceName} on ${displayDate}. Use the site search for more days and sources.`}
      </p>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border bg-white p-6">
          <p className="text-slate-700">
            No data for this date yet. Check your URL or try another
            date/source.
          </p>
          <div className="mt-4 text-sm text-slate-500">
            <div>Debug:</div>
            <ul className="list-disc pl-5">
              <li>
                source_slug = <code>{source}</code>
              </li>
              <li>
                puzzle_date = <code>{isoDate}</code>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <ul className="mt-8 divide-y rounded-xl border bg-white">
          {/* {rows.map((r) => (
            <li
              key={r.occurrence_id}
              className="flex items-start justify-between gap-4 p-4"
            >
              <div>
                <div className="text-slate-800">{r.clue_text}</div>
                <div className="text-xs text-slate-500">
                  {r.direction ?? '—'} {r.number ?? '—'} ·{' '}
                  {r.puzzle_date ? formatPuzzleDateLong(r.puzzle_date) : '—'}
                </div>
              </div>
              <div className="text-lg font-semibold tracking-wide">
                {r.answer_pretty ?? r.answer ?? '—'}
              </div>
            </li>
          ))} */}
          {rows.map((r) => {
            const positionLabel =
              r.number && r.direction
                ? `${r.number} ${r.direction === 'across' ? 'Across' : 'Down'}`
                : '—';

            return (
              <li
                key={r.occurrence_id}
                className="flex items-start justify-between gap-4 p-4"
              >
                <div>
                  <div className="text-slate-800">{r.clue_text}</div>
                  <div className="text-xs text-slate-500">
                    {positionLabel} ·{' '}
                    {r.puzzle_date ? formatPuzzleDateLong(r.puzzle_date) : '—'}
                  </div>
                </div>
                <div className="text-lg font-semibold tracking-wide">
                  {r.answer_pretty ?? r.answer ?? '—'}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
