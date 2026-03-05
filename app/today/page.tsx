// app/today/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getSourceDisplay } from '@/lib/sourceDisplay';

export const metadata: Metadata = {
  title: "Today's Crosswords | Verba",
  description:
    "Open today's crossword answers by puzzle source including NYT Mini and NYT Crossword.",
  alternates: { canonical: 'https://tryverba.com/today' },
};

const TODAY_SOURCES = [
  { slug: 'nyt-mini', active: true },
  { slug: 'nyt-crossword', active: true },
] as const;

function formatToday() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TodayIndexPage() {
  const active = TODAY_SOURCES.filter((s) => s.active);
  const today = formatToday();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Today’s Crossword Answers</h1>

        <p className="text-slate-600">
          Find today’s crossword clues and answers for <strong>{today}</strong>.
          Select a puzzle source below to view the latest crossword solutions.
        </p>
      </header>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold">Choose a puzzle</h2>

        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {active.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/answers/${encodeURIComponent(s.slug)}/today`}
                className="btn-marigold-hover btn-press block rounded-lg border bg-white px-3 py-2 text-center text-sm"
              >
                {getSourceDisplay(s.slug)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
