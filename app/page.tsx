// app/page.tsx
import { SearchBar } from '@/components/SearchBar';
import { Card, CardBody } from '@/components/ui/Card';
import { TopSearches } from '@/components/TopSearches';
import { EmailSubscribe } from '@/components/EmailSubscribe';
import Link from 'next/link';
import { getSourceDisplay } from '@/lib/sourceDisplay';

export const dynamic = 'force-dynamic';

const TODAYS_PUZZLES = [
  {
    slug: 'nyt-mini',
    active: true,
  },
  {
    slug: 'nyt-crossword',
    active: true,
  },
  {
    slug: 'la-times',
    active: true,
  },
  {
    slug: 'the-guardian',
    active: false,
  },
  {
    slug: 'the-atlantic',
    active: false,
  },
  {
    slug: 'usa-today',
    active: false,
  },
] as const;

const POPULAR_PATTERNS = [
  { label: '5-letter words starting with A', pattern: 'A____' },
  { label: '5-letter words starting with S', pattern: 'S____' },
  { label: '5-letter words starting with T', pattern: 'T____' },
  { label: '5-letter words starting with C', pattern: 'C____' },
  { label: '5-letter words starting with R', pattern: 'R____' },
  { label: '5-letter words starting with P', pattern: 'P____' },
  { label: 'Words starting with AR', pattern: 'AR___' },
  { label: 'Words starting with RE', pattern: 'RE___' },
  { label: 'Words starting with ST', pattern: 'ST___' },
  { label: 'Words starting with TR', pattern: 'TR___' },
  { label: 'Words starting with IN', pattern: 'IN___' },
  { label: 'Words starting with CO', pattern: 'CO___' },
];

export default function HomePage() {
  return (
    <>
      <section className="space-y-4 text-center">
        <h1 className="text-brand-ink text-3xl font-bold">Stuck on a clue?</h1>
        <p className="text-brand-slate-600">
          Get instant crossword answers — search by clue text or pattern.
        </p>
        <SearchBar />
      </section>

      <section className="mt-10">
        <TopSearches />
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="text-brand-ink text-lg font-semibold">
          Today’s Puzzles
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TODAYS_PUZZLES.map((puzzle) =>
            puzzle.active ? (
              <Link
                key={puzzle.slug}
                href={`/answers/${puzzle.slug}/today`}
                className="block"
              >
                <Card className="card-hover-marigold card-lift transition">
                  <CardBody className="space-y-1 text-center font-medium">
                    <div>{getSourceDisplay(puzzle.slug)}</div>

                    <div className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                      Today
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ) : (
              <Card key={puzzle.slug} className="cursor-not-allowed opacity-50">
                <CardBody className="text-center font-medium">
                  {getSourceDisplay(puzzle.slug)}
                  <div className="mt-1 text-xs text-slate-500">Coming soon</div>
                </CardBody>
              </Card>
            ),
          )}
        </div>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="text-brand-ink text-lg font-semibold">
          Crossword Tools
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/answers/common" className="block">
            <Card className="card-hover-marigold card-lift">
              <CardBody className="text-center font-medium">
                Most Common Answers
                <div className="mt-1 text-xs text-slate-500">
                  See the answers that appear most often in crosswords.
                </div>
              </CardBody>
            </Card>
          </Link>

          <Link href="/search" className="block">
            <Card className="card-hover-marigold card-lift">
              <CardBody className="text-center font-medium">
                Crossword Solver
                <div className="mt-1 text-xs text-slate-500">
                  Search by clue text or pattern.
                </div>
              </CardBody>
            </Card>
          </Link>
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-brand-ink text-lg font-semibold">How It Works</h2>
        <Card>
          <CardBody>
            <p className="text-brand-slate-700">
              Verba is your crossword assistant. Type a clue or pattern like{' '}
              <span className="bg-brand-slate-50 rounded px-1 py-0.5 font-mono">
                D?NIM
              </span>{' '}
              to instantly find possible matches from today’s puzzles.
            </p>
          </CardBody>
        </Card>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="text-brand-ink text-lg font-semibold">
          Popular Crossword Patterns
        </h2>

        <Card>
          <CardBody>
            <p className="mb-3 text-sm text-slate-600">
              Browse common crossword answer patterns by known letters.
            </p>

            <div className="flex flex-wrap gap-2">
              {POPULAR_PATTERNS.map((item) => (
                <Link
                  key={item.pattern}
                  href={`/pattern/${encodeURIComponent(item.pattern)}`}
                  className="btn-press btn-marigold-hover rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-verba-blue"
                >
                  {item.pattern}
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="mt-20 border-t bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl space-y-4 px-4 text-center">
          <h2 className="text-xl font-semibold">Get better at crosswords</h2>
          <p className="text-sm text-slate-600">
            Occasional tips, new features, and improvements to Verba. No spam.
          </p>

          <div className="mx-auto w-full max-w-2xl">
            <EmailSubscribe source="home_bottom" />
          </div>
        </div>
      </section>
    </>
  );
}
