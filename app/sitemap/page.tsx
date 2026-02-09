// app/sitemap/page.tsx

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatPuzzleDateLong } from '@/lib/formatDate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HtmlSitemapPage() {
  /* -----------------------------
     Fetch data (lightweight)
  ----------------------------- */

  const [{ data: sources }, { data: daily }, { data: clues }, { data: quick }] =
    await Promise.all([
      supabase.from('puzzle_source').select('slug, name').order('name'),

      supabase
        .from('v_search_results_pretty')
        .select('source_slug, puzzle_date')
        .order('puzzle_date', { ascending: false })
        .limit(25),

      supabase
        .from('v_search_results_pretty')
        .select('clue_slug_readable, clue_text')
        .order('puzzle_date', { ascending: false })
        .limit(25),

      supabase
        .from('quick_clue_page')
        .select('slug, last_seen')
        .eq('is_live', true)
        .order('last_seen', { ascending: false })
        .limit(25),
    ]);

  /* -----------------------------
     Helpers
  ----------------------------- */

  const uniqueDaily = Array.from(
    new Map(
      (daily ?? []).map((d) => [`${d.source_slug}-${d.puzzle_date}`, d]),
    ).values(),
  );

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Sitemap</h1>
        <p className="mt-2 text-slate-600">
          Browse all major sections of Verba — crossword answers, clues,
          puzzles, and quick-solve pages.
        </p>
      </header>

      {/* -----------------------------
          Puzzle Sources
      ----------------------------- */}
      <section>
        <h2 className="text-lg font-semibold">Puzzle Sources</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          {(sources ?? []).map((s) => (
            <li key={s.slug}>
              <Link
                href={`/answers/${s.slug}`}
                className="verba-link text-verba-blue"
              >
                {s.name ?? s.slug}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* -----------------------------
          Recent Daily Answers
      ----------------------------- */}
      <section>
        <h2 className="text-lg font-semibold">Recent Daily Answer Pages</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {uniqueDaily.map((d) => (
            <li key={`${d.source_slug}-${d.puzzle_date}`}>
              <Link
                href={`/answers/${d.source_slug}/${d.puzzle_date}`}
                className="verba-link text-verba-blue"
              >
                {d.source_slug} — {formatPuzzleDateLong(d.puzzle_date)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* -----------------------------
          Popular Clues
      ----------------------------- */}
      <section>
        <h2 className="text-lg font-semibold">Recent Clue Pages</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {(clues ?? []).map((c) => (
            <li key={c.clue_slug_readable}>
              <Link
                href={`/clue/${c.clue_slug_readable}`}
                className="verba-link text-verba-blue"
              >
                {c.clue_text}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* -----------------------------
          Quick Clue Pages
      ----------------------------- */}
      <section>
        <h2 className="text-lg font-semibold">Quick Clue Pages</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {(quick ?? []).map((q) => (
            <li key={q.slug}>
              <Link
                href={`/quick-clue/${q.slug}`}
                className="verba-link text-verba-blue"
              >
                {q.slug.replace(/-/g, ' ')}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* -----------------------------
          Utility
      ----------------------------- */}
      <section>
        <h2 className="text-lg font-semibold">More</h2>
        <ul className="mt-3 space-y-1 text-sm">
          <li>
            <Link href="/search" className="verba-link text-verba-blue">
              Search crossword clues
            </Link>
          </li>
          <li>
            <Link href="/" className="verba-link text-verba-blue">
              Home
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
