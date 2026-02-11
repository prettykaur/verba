// app/answers/common/[answer]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';

export const revalidate = 3600;

const BASE_URL = 'https://tryverba.com';
const OCCURRENCE_LIMIT = 60;

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
  params: Promise<{ answer: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { answer } = await params;
  const key = normalizeToKey(decodeURIComponent(answer));

  if (!key) {
    return { title: 'Common Crossword Answers | Verba' };
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
      description: `Crossword answer page for ${key}.`,
      robots: { index: false, follow: true },
    };
  }

  const s = data as StatsRow;
  const slug = toLowerSlug(s.answer_key);
  const canonical = `${BASE_URL}/answers/common/${encodeURIComponent(slug)}`;
  const lastSeen = s.last_seen
    ? formatPuzzleDateLong(String(s.last_seen).slice(0, 10))
    : null;

  const title = `${s.answer_key} — Common Crossword Answer (${s.answer_len} letters) | Verba`;
  const description = `See where the answer "${s.answer_key}" appears in crosswords. Seen ${s.occurrence_count} time${
    s.occurrence_count === 1 ? '' : 's'
  }${lastSeen ? `, last seen ${lastSeen}` : ''}.`;

  // Optional: only index “meaningful” common answers.
  // Change threshold anytime.
  const INDEX_THRESHOLD = 3;

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

export default async function CommonAnswerPage({ params }: PageProps) {
  const { answer } = await params;
  const decoded = decodeURIComponent(answer);

  // Enforce lowercase URL
  if (decoded !== decoded.toLowerCase()) {
    permanentRedirect(
      `/answers/common/${encodeURIComponent(decoded.toLowerCase())}`,
    );
  }

  const key = normalizeToKey(decoded);
  if (!key) notFound();

  // Stats
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
  const lastSeen = stats.last_seen
    ? String(stats.last_seen).slice(0, 10)
    : null;

  // Fetch canonical occurrence_id for last seen puzzle
  let lastOccurrenceId: number | null = null;

  if (lastSeen && stats.last_seen_source_slug) {
    const { data: lastOcc } = await supabase
      .from('v_search_results_pretty')
      .select('occurrence_id')
      .eq('answer_key', key)
      .eq('puzzle_date', lastSeen)
      .eq('source_slug', stats.last_seen_source_slug)
      .limit(1)
      .maybeSingle();

    lastOccurrenceId = lastOcc?.occurrence_id ?? null;
  }

  // Occurrences (recent)
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
      puzzle_date,
      answer_key
    `,
    )
    .eq('answer_key', key)
    .order('puzzle_date', { ascending: false })
    .limit(OCCURRENCE_LIMIT);

  if (occErr) console.error('Supabase @common answer occurrences:', occErr);

  const occ = (occData ?? []) as OccRow[];

  const lastSeenLabel = lastSeen ? formatPuzzleDateLong(lastSeen) : null;

  return (
    <div className="space-y-6">
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

      <header className="grid items-start gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {stats.answer_key} - Common Crossword Answer
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

            {lastSeen && stats.last_seen_source_slug && lastOccurrenceId && (
              <>
                <span aria-hidden>·</span>
                <Link
                  href={`/answers/${stats.last_seen_source_slug}/${lastSeen}#clue-${lastOccurrenceId}`}
                  scroll={false}
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
              href={`/answers/common?len=${stats.answer_len}`}
              className="verba-link text-sm text-verba-blue"
            >
              Browse more {stats.answer_len}-letter answers →
            </Link>
          </div>
        </div>
      </header>

      <hr className="border-slate-200" />

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
          {occ.map((r) => {
            const date = r.puzzle_date
              ? String(r.puzzle_date).slice(0, 10)
              : null;
            const dateLabel = date ? formatPuzzleDateLong(date) : null;
            const directionLabel =
              r.direction === 'across'
                ? 'Across'
                : r.direction === 'down'
                  ? 'Down'
                  : '';

            const clueHref = r.clue_slug
              ? `/clue/${encodeURIComponent(r.clue_slug)}`
              : `/clue/${r.occurrence_id}`; // fallback if slug missing

            const puzzleHref =
              r.source_slug && date
                ? `/answers/${encodeURIComponent(r.source_slug)}/${encodeURIComponent(date)}`
                : null;

            return (
              <li
                key={r.occurrence_id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <Link
                    href={clueHref}
                    className="verba-link text-[0.98rem] font-medium leading-snug text-slate-900"
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
                            scroll={false}
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

          {occ.length === 0 && (
            <li className="py-6 text-sm text-slate-600">
              No appearances found.
            </li>
          )}
        </ul>
      </section>

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
