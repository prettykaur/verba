// app/quick-clue/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { decodeQuickClueSlug } from '@/lib/quickClueSlug';
import { RevealAnswer } from '@/components/RevealAnswer';
import type { Metadata } from 'next';
import { buildBreadcrumb } from '@/lib/schema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

/* -----------------------------
   Helpers
----------------------------- */

function phraseToTokens(phrase: string) {
  return phrase
    .toLowerCase()
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 2 &&
        !['of', 'for', 'the', 'and', 'with', 'from'].includes(w),
    );
}

function titleCase(str: string) {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function formatShortDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/* -----------------------------
   Metadata
----------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { phrase, answerLen } = decodeQuickClueSlug(slug);

  if (!phrase) {
    return {
      title: 'Crossword Answers | Verba',
      description: 'Find crossword answers and clue solutions.',
    };
  }

  const phraseTitle = titleCase(phrase);

  const title = answerLen
    ? `${answerLen}-Letter Word for ${phraseTitle} (Crossword Answers)`
    : `${phraseTitle} – Crossword Answers`;

  const description = answerLen
    ? `Find ${answerLen}-letter crossword answers for the clue "${phrase}". Includes frequency data and recent puzzle appearances.`
    : `Find possible crossword answers for the clue "${phrase}", based on historical puzzle data.`;

  const canonical = `https://tryverba.com/quick-clue/${encodeURIComponent(
    slug,
  )}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      siteName: 'Verba',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

/* -----------------------------
   Page
----------------------------- */

export default async function QuickCluePage({ params }: PageProps) {
  const { slug } = await params;

  /* -----------------------------
     1️⃣ Decode slug
  ----------------------------- */

  const { phrase, answerLen } = decodeQuickClueSlug(slug);

  if (!phrase || phrase.length < 2) {
    notFound();
  }

  const phraseTitle = titleCase(phrase);

  const canonicalUrl = `https://tryverba.com/quick-clue/${encodeURIComponent(
    slug,
  )}`;

  /* -----------------------------
     2️⃣ Soft page lookup (non-blocking)
  ----------------------------- */

  await supabase
    .from('quick_clue_page')
    .select('slug')
    .eq('slug', slug)
    .eq('is_live', true)
    .maybeSingle();

  /* -----------------------------
     3️⃣ Fetch matching clues
     (NO joins, view-only, safe for anon)
  ----------------------------- */

  const tokens = phraseToTokens(phrase);

  let query = supabase
    .from('v_search_results_pretty')
    .select(
      `
        occurrence_id,
        clue_slug_readable,
        clue_text,
        answer_pretty,
        answer_len,
        puzzle_date,
        source_name,
        direction
      `,
    )
    .order('puzzle_date', { ascending: false })
    .limit(400);

  for (const token of tokens) {
    query = query.ilike('clue_text', `%${token}%`);
  }

  const { data: matches, error } = await query;

  if (error || !matches) {
    console.error('[quick-clue] match error:', error);
    notFound();
  }

  /* -----------------------------
     4️⃣ Aggregate answers
  ----------------------------- */

  type AnswerAgg = {
    answer: string;
    count: number;
    firstSeen: string;
    lastSeen: string;
    examples: string[];
    primaryOccurrenceId: number;
    primaryClueSlug: string;
    sourceName?: string;
    direction?: 'across' | 'down' | null;
  };

  const map = new Map<string, AnswerAgg>();

  for (const row of matches) {
    const ans = row.answer_pretty?.trim();
    if (!ans) continue;

    if (answerLen && row.answer_len !== answerLen) continue;
    if (!/^[A-Z ]+$/i.test(ans)) continue;

    const existing = map.get(ans);

    if (!existing) {
      map.set(ans, {
        answer: ans,
        count: 1,
        firstSeen: row.puzzle_date,
        lastSeen: row.puzzle_date,
        examples: [row.clue_text],
        primaryOccurrenceId: row.occurrence_id,
        primaryClueSlug: row.clue_slug_readable,
        sourceName: row.source_name ?? undefined,
        direction: row.direction ?? null,
      });
    } else {
      existing.count += 1;

      if (row.puzzle_date < existing.firstSeen) {
        existing.firstSeen = row.puzzle_date;
      }
      if (row.puzzle_date > existing.lastSeen) {
        existing.lastSeen = row.puzzle_date;
      }

      if (
        existing.examples.length < 3 &&
        !existing.examples.includes(row.clue_text)
      ) {
        existing.examples.push(row.clue_text);
      }
    }
  }

  /* -----------------------------
     5️⃣ Rank & trim
  ----------------------------- */

  let answers = Array.from(map.values());

  answers.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.lastSeen.localeCompare(a.lastSeen);
  });

  answers = answers.slice(0, 20);

  if (answers.length === 0) {
    notFound();
  }

  /* -----------------------------
     FAQSchema
  ----------------------------- */

  const topAnswers = answers.slice(0, 3).map((a) => a.answer);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What are the possible crossword answers for "${phrase}"?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Some possible crossword answers for "${phrase}" include: ${topAnswers.join(
            ', ',
          )}.`,
        },
      },
      ...(answerLen
        ? [
            {
              '@type': 'Question',
              name: `How many letters is the answer to "${phrase}"?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `The answer is ${answerLen} letters long.`,
              },
            },
          ]
        : []),
      {
        '@type': 'Question',
        name: `What is the most common crossword answer for "${phrase}"?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The most common answer is "${answers[0].answer}", which has appeared ${answers[0].count} ${
            answers[0].count === 1 ? 'time' : 'times'
          }.`,
        },
      },
    ],
  };

  /* -----------------------------
     Compute tokens + URLs
  ----------------------------- */

  const tokensForLinks = phraseToTokens(phrase);
  const primaryToken = tokensForLinks[0] ?? null;
  const secondaryToken = tokensForLinks.length > 1 ? tokensForLinks[1] : null;

  const letterSearchHref = answerLen ? `/search?len=${answerLen}` : null;

  const tokenSearchHref = primaryToken
    ? `/search?q=${encodeURIComponent(primaryToken)}`
    : null;

  /* -----------------------------
     Breadcrumb Schema
  ----------------------------- */

  const breadcrumb = buildBreadcrumb([
    { name: 'Home', url: 'https://tryverba.com' },
    {
      name: 'Quick Clues',
      url: 'https://tryverba.com/browse',
    },
    {
      name: phraseTitle,
      url: canonicalUrl,
    },
  ]);
  /* -----------------------------
     6️⃣ Render
  ----------------------------- */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {answerLen
          ? `${answerLen}-Letter Word for ${titleCase(
              phrase,
            )} (Crossword Answers)`
          : `${titleCase(phrase)} – Crossword Answers`}
      </h1>

      <p className="text-slate-600">
        Below are possible crossword answers for the clue{' '}
        <strong>{phrase}</strong>
        {answerLen
          ? `, all with ${answerLen} letters.`
          : ', based on historical puzzle data.'}
      </p>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-sm font-semibold">Possible answers</h2>

        <p className="mt-1 space-y-2 text-xs text-slate-500">
          Showing <strong>{answers.length}</strong> crossword answer
          {answers.length === 1 ? '' : 's'} for <strong>“{phrase}”</strong>
          {answerLen ? ` (${answerLen} letters)` : ''}
        </p>

        <ul className="mt-3 space-y-3">
          {answers.map((a) => {
            const letterCount = a.answer.replace(/[^A-Za-z]/g, '').length;

            return (
              <li
                key={a.answer}
                className="space-y-2 rounded-lg border bg-slate-50 p-3 text-sm"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <RevealAnswer
                    answer={a.answer}
                    size="md"
                    eventProps={{
                      surface: 'quick_clue',
                      clue_phrase: phrase,
                      answer_len: letterCount,
                    }}
                  />

                  <span className="mt-0.5 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                    Seen {a.count} {a.count === 1 ? 'time' : 'times'}
                  </span>
                </div>

                {/* Metadata */}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  <span>
                    {letterCount} letter{letterCount === 1 ? '' : 's'}
                  </span>

                  {a.direction && (
                    <>
                      <span aria-hidden className="opacity-60">
                        •
                      </span>
                      <span className="capitalize">{a.direction}</span>
                    </>
                  )}

                  <span aria-hidden className="opacity-60">
                    •
                  </span>

                  {a.sourceName && (
                    <a
                      href={`/answers/${encodeURIComponent(a.sourceName.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="verba-link text-verba-blue"
                    >
                      {a.sourceName}
                    </a>
                  )}

                  <span aria-hidden className="opacity-60">
                    •
                  </span>

                  <span>Last seen {formatShortDate(a.lastSeen)}</span>
                </div>

                {/* Answer actions */}
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600">
                  <a
                    href={`/search?q=${encodeURIComponent(a.answer)}`}
                    className="verba-link text-verba-blue"
                  >
                    Search
                  </a>

                  <span aria-hidden>·</span>

                  {/* ✅ CANONICAL, SAFE LINK */}
                  <a
                    href={`/clue/${encodeURIComponent(a.primaryClueSlug)}?occ=${a.primaryOccurrenceId}`}
                    className="verba-link text-verba-blue"
                  >
                    View clue
                  </a>

                  <span aria-hidden>·</span>

                  {/* Link to Common Answer Page */}
                  <a
                    href={`/answers/common/${encodeURIComponent(a.answer.toLowerCase())}`}
                    className="verba-link text-verba-blue"
                  >
                    Answer history
                  </a>
                </div>

                {/* Example clues */}
                {a.examples.length > 0 && (
                  <div className="mt-2 space-y-2 rounded-md bg-white/60 p-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-700">
                      Example clues:
                    </span>
                    <ul className="mt-1 list-disc pl-4">
                      {a.examples.map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
        <h2 className="font-medium text-slate-800">
          Explore more crossword answers
        </h2>

        <ul className="mt-2 list-disc space-y-1 pl-4">
          {letterSearchHref && (
            <li>
              <a href={letterSearchHref} className="verba-link text-verba-blue">
                Looking for another {answerLen}-letter crossword answer?
              </a>
            </li>
          )}

          {tokenSearchHref && (
            <li>
              <a href={tokenSearchHref} className="verba-link text-verba-blue">
                Browse all crossword clues containing “{primaryToken}”
              </a>
            </li>
          )}

          {secondaryToken && secondaryToken !== primaryToken && (
            <li>
              <a
                href={`/search?q=${encodeURIComponent(secondaryToken)}`}
                className="verba-link text-verba-blue"
              >
                Browse all crossword clues containing “{secondaryToken}”
              </a>
            </li>
          )}
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb),
        }}
      />
    </div>
  );
}
