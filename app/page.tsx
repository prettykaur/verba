// app/page.tsx
import { SearchBar } from '@/components/SearchBar';
import { Card, CardBody } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <section className="space-y-4 text-center">
          <h1 className="text-brand-ink text-3xl font-bold">
            Stuck on a clue?
          </h1>
          <p className="text-brand-slate-600">
            Get instant crossword answers — search by clue text or pattern.
          </p>
          <SearchBar />
        </section>

        <section className="mt-12 space-y-3">
          <h2 className="text-brand-ink text-lg font-semibold">
            Today’s Puzzles
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              'NYT Mini',
              'LA Times',
              'The Guardian',
              'The Atlantic',
              'Newsday',
              'The Telegraph',
            ].map((name) => (
              <Card key={name}>
                <CardBody className="text-brand-slate-700 text-center font-medium">
                  {name}
                </CardBody>
              </Card>
            ))}
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
      </main>
    </>
  );
}
