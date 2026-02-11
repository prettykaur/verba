// app/answers/common/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';

export const revalidate = 3600;

const BASE_URL = 'https://tryverba.com';
const OCCURRENCE_LIMIT = 60;
const INDEX_THRESHOLD = 3;

// Keep URLs lowercase; treat answer as crossword fill (letters only)
function normalizeToKey(param: string) {
  return (param ?? '').replace(/[^a-zA-Z]/g, '').toUpperCase();
}

function toLowerSlug(key: string) {
  return key.toLowerCase();
}

type StatsRow = {
  answer_key: string;
  answer_len: number;
  occurrence_count: number;
  last_seen: string | null;
  last_seen_source_slug: string | null;
};

type OccRow = {
  occurrence_id: number;
  clue_text: string;
  clue_slug: string | null;
  number: number | null;
  direction: 'across' | 'down' | null;
  source_slug: string;
  source_name: string | null;
  puzzle_date: string | null;
  answer_key: string;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

/* =========================
   Metadata
========================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const key = normalizeToKey(decodeURIComponent(slug));

  if (!key) {
    return {
      title: 'Common Crossword Answers | Verba',
    };
  }

  // Pull stats (for title/description)
  const { data } = await supabase
    .from('v_answer_stats')
    .select(
      'answer_key, answer_len, occurrence_count, last_seen, last_seen_source_slug',
    )
    .eq('answer_key', key)
    .maybeSingle();

  if (!data) {
    return {
      title: `${key} — Crossword Answer | Verba`,
      robots: { index: false, follow: true },
    };
  }

  const s = data as StatsRow;
  const canonical = `${BASE_URL}/answers/common/${encodeURIComponent(
    toLowerSlug(s.answer_key),
  )}`;

  const lastSeen = s.last_seen
    ? formatPuzzleDateLong(String(s.last_seen).slice(0, 10))
    : null;

  const title = `${s.answer_key} — Common Crossword Answer (${s.answer_len} letters) | Verba`;

  const description = `See where the answer "${s.answer_key}" appears in crosswords. Seen ${
    s.occurrence_count
  } time${s.occurrence_count === 1 ? '' : 's'}${
    lastSeen ? `, last seen ${lastSeen}` : ''
  }.`;

  return {
    title,
    description,
    alternates: { canonical },
    robots:
      s.occurrence_count >= INDEX_THRESHOLD
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Verba',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/* =========================
   Explanation Generator
========================= */

function generateExplanation(answer: string, len: number) {
  const vowelCount = answer.replace(/[^AEIOU]/gi, '').length;

  const vowelComment =
    vowelCount >= 2
      ? 'Its vowel-heavy structure makes it easy to slot into many grid patterns.'
      : 'Its letter pattern fits well into a variety of grid structures.';

  const lengthComment =
    len <= 4
      ? 'Short entries like this are especially valuable in compact crossword formats such as daily minis.'
      : 'Medium-length entries like this work across a wide range of crossword formats, from themed puzzles to larger grids.';

  return `${answer} is a ${len}-letter crossword answer that appears regularly in published crossword puzzles. Constructors rely on versatile entries like ${answer} to fill tight grid spaces and connect longer theme answers. ${vowelComment} ${lengthComment}`;
}

/* =========================
   Page
========================= */

export default async function CommonAnswerPage({ params }: PageProps) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  // Enforce lowercase canonical URL
  if (decoded !== decoded.toLowerCase()) {
    permanentRedirect(
      `/answers/common/${encodeURIComponent(decoded.toLowerCase())}`,
    );
  }

  const key = normalizeToKey(decoded);
  if (!key) notFound();

  /* ===== Fetch Stats ===== */

  const { data: statsData, error: statsErr } = await supabase
    .from('v_answer_stats')
    .select(
      'answer_key, answer_len, occurrence_count, last_seen, last_seen_source_slug',
    )
    .eq('answer_key', key)
    .maybeSingle();

  if (statsErr) console.error('Supabase @common answer stats:', statsErr);
  if (!statsData) notFound();

  const stats = statsData as StatsRow;

  const lastSeenISO = stats.last_seen
    ? String(stats.last_seen).slice(0, 10)
    : null;

  const lastSeenLabel = lastSeenISO ? formatPuzzleDateLong(lastSeenISO) : null;

  /* ===== Fetch Recent Occurrences ===== */

  const { data: occData, error: occErr } = await supabase
    .from('v_occurrence_answer_key')
    .select(
      `
      occurrence_id,
      clue_text,
      clue_slug,
      number,
      direction,
      source_slug,
      source_name,
      puzzle_date
    `,
    )
    .eq('answer_key', key)
    .order('puzzle_date', { ascending: false })
    .limit(OCCURRENCE_LIMIT);

  if (occErr) console.error('Supabase @common answer occurrences:', occErr);

  const occurrences = (occData ?? []) as OccRow[];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500">
        <Link href="/" className="verba-link text-verba-blue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/answers" className="verba-link text-verba-blue">
          Answers
        </Link>
        <span className="mx-2">/</span>
        <Link href="/answers/common" className="verba-link text-verba-blue">
          Common Answers
        </Link>
        <span className="mx-2">/</span>
        <span>{stats.answer_key}</span>
      </nav>

      {/* Header */}
      <header className="grid items-start gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {stats.answer_key} — Common Crossword Answer
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span>{stats.answer_len} letters</span>
            <span aria-hidden>·</span>
            <span>
              Seen{' '}
              <strong className="text-slate-900">
                {stats.occurrence_count}
              </strong>{' '}
              {stats.occurrence_count === 1 ? 'time' : 'times'}
            </span>
            {/* {stats.answer_len} letters · Seen{' '}
          <strong>{stats.occurrence_count}</strong>{' '}
          {stats.occurrence_count === 1 ? 'time' : 'times'} */}
            {lastSeenLabel && stats.last_seen_source_slug && (
              <>
                <span aria-hidden>·</span>
                <Link
                  href={`/answers/${stats.last_seen_source_slug}/${lastSeenISO}`}
                  className="verba-link text-verba-blue"
                >
                  Last seen {lastSeenLabel}
                </Link>
              </>
            )}
          </div>

          {stats.occurrence_count < 3 && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p>
                This answer appears infrequently in published crossword puzzles.
                Some answers are rare, puzzle-specific, or regionally used,
                which means there may not yet be many recorded clues.
              </p>
            </div>
          )}

          <div className="pt-3">
            <Link
              href={`/answers/common/${stats.answer_len}-letter`}
              className="verba-link text-sm text-verba-blue"
            >
              Browse more {stats.answer_len}-letter answers →
            </Link>
          </div>
        </div>
      </header>

      {/* Explanation */}
      <section className="rounded-xl border bg-white p-4 text-sm text-slate-700">
        <h2 className="mb-2 text-base font-semibold text-slate-900">
          Why is {stats.answer_key} common in crosswords?
        </h2>
        <p>{generateExplanation(stats.answer_key, stats.answer_len)}</p>
      </section>

      <hr className="border-slate-200" />

      {/* Recent Appearances */}
      <section className="rounded-xl border bg-white">
        <div className="px-4 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Recent appearances
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Here are some recent clues that use{' '}
            <strong>{stats.answer_key}</strong>.
          </p>
        </div>

        <hr className="border-slate-200" />

        <ul className="divide-y">
          {occurrences.map((r) => {
            const dateISO = r.puzzle_date
              ? String(r.puzzle_date).slice(0, 10)
              : null;

            const dateLabel = dateISO ? formatPuzzleDateLong(dateISO) : null;

            const directionLabel =
              r.direction === 'across'
                ? 'Across'
                : r.direction === 'down'
                  ? 'Down'
                  : '';

            const clueHref = r.clue_slug
              ? `/clue/${encodeURIComponent(r.clue_slug)}`
              : `/clue?occ=${r.occurrence_id}`;

            const puzzleHref =
              r.source_slug && dateISO
                ? `/answers/${encodeURIComponent(r.source_slug)}/${encodeURIComponent(dateISO)}`
                : null;

            return (
              <li
                key={r.occurrence_id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <Link
                    href={clueHref}
                    className="verba-link font-medium text-slate-900"
                  >
                    {r.clue_text}
                  </Link>

                  <div className="mt-1 text-xs text-slate-500">
                    {typeof r.number === 'number' && directionLabel && (
                      <>
                        {r.number} {directionLabel}
                        <span aria-hidden> · </span>
                      </>
                    )}

                    <Link
                      href={`/answers/${encodeURIComponent(r.source_slug)}`}
                      className="verba-link text-verba-blue"
                    >
                      {r.source_name ?? r.source_slug}
                    </Link>

                    {dateLabel && (
                      <>
                        <span aria-hidden> · </span>
                        {puzzleHref ? (
                          <Link
                            href={`${puzzleHref}#clue-${r.occurrence_id}`}
                            className="verba-link text-verba-blue"
                          >
                            Last seen {dateLabel}
                          </Link>
                        ) : (
                          dateLabel
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex sm:justify-end">
                  <Link
                    href={clueHref}
                    className="btn-press btn-marigold-hover rounded-lg border px-3 py-1.5 text-sm font-medium"
                  >
                    View →
                  </Link>
                </div>
              </li>
            );
          })}

          {occurrences.length === 0 && (
            <li className="p-6 text-sm text-slate-600">
              No appearances found.
            </li>
          )}
        </ul>
      </section>

      {/* Related */}
      <section className="rounded-xl border bg-slate-50 p-4 text-sm">
        <h2 className="font-semibold">Related</h2>
        <ul className="mt-2 space-y-1 text-slate-700">
          <li>
            <Link
              href={`/search?q=${encodeURIComponent(stats.answer_key)}`}
              className="verba-link text-verba-blue"
            >
              View all clues that use {stats.answer_key} →
            </Link>
          </li>
          <li>
            <Link href="/answers/common" className="verba-link text-verba-blue">
              Back to Common Answers →
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
