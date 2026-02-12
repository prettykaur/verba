// app/browse/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Browse Crossword Answers | Verba',
  description:
    'Explore crossword answers by letter, length, source, or frequency.',
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LENGTHS = [3, 4, 5, 6, 7];

const SOURCES = [
  { name: 'Classic Crossword Clues', slug: 'seed' },
  { name: 'NYT Mini', slug: 'nyt-mini' },
  { name: 'LA Times', slug: 'la-times' },
  { name: 'The Guardian', slug: 'guardian' },
  { name: 'USA Today', slug: 'usa-today' },
];

export default function BrowsePage() {
  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500">
        <Link href="/" className="verba-link text-verba-blue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>Browse</span>
      </nav>

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Browse Crossword Answers</h1>
        <p className="max-w-3xl text-slate-600">
          Discover crossword answers by letter, length, source, or frequency.
        </p>
      </header>

      {/* Common Answers */}
      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          Most Common Answers
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Explore answers that appear most frequently in crosswords.
        </p>

        <div className="mt-4">
          <Link href="/answers/common" className="verba-link text-verba-blue">
            View Common Answers →
          </Link>
        </div>
      </section>

      {/* Browse by Length */}
      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          Browse by Length
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {LENGTHS.map((n) => (
            <Link
              key={n}
              href={`/answers/common/length/${n}-letter`}
              className="btn-press btn-marigold-hover rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-verba-blue"
            >
              {n}-letter
            </Link>
          ))}

          <Link
            href="/answers/common/length/8-plus"
            className="btn-press btn-marigold-hover rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-verba-blue"
          >
            8+ letters
          </Link>
        </div>
      </section>

      {/* Browse by Letter */}
      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          Browse Alphabetically
        </h2>

        <div className="sm:grid-cols-13 mt-4 grid grid-cols-7 gap-2 text-sm">
          {LETTERS.map((letter) => (
            <Link
              key={letter}
              href={`/answers/common/starts/${letter}`}
              className="btn-press btn-marigold-hover rounded border border-slate-200 py-1 text-center font-medium text-verba-blue"
            >
              {letter}
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by Source */}
      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          Browse by Puzzle Source
        </h2>

        <ul className="mt-4 space-y-2 text-sm">
          {SOURCES.map((src) => (
            <li key={src.slug}>
              <Link
                href={`/answers/${src.slug}`}
                className="verba-link text-verba-blue"
              >
                {src.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
