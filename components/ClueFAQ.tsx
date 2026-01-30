// components/ClueFAQ.tsx
import Link from 'next/link';

type ClueFAQProps = {
  clue: string;
  answer: string;
  letterCount: number;
  puzzleDate?: string;
  sourceName?: string;
  sourceHref?: string;
  dateHref?: string;
  seenInCount?: number | null;
};

export function ClueFAQ({
  clue,
  answer,
  letterCount,
  puzzleDate,
  sourceName,
  sourceHref,
  dateHref,
  seenInCount,
}: ClueFAQProps) {
  const faqs = [
    {
      q: `What is the answer to "${clue}"?`,
      a: <span>{answer}</span>,
    },
    {
      q: `How many letters is the answer to "${clue}"?`,
      a: (
        <span>
          The answer has {letterCount}{' '}
          {letterCount === 1 ? 'letter' : 'letters'}.
        </span>
      ),
    },
    puzzleDate && sourceName
      ? {
          q: 'When was this clue last seen?',
          a: (
            <span>
              This clue last appeared in the{' '}
              {sourceHref ? (
                <Link href={sourceHref} className="verba-link text-verba-blue">
                  {sourceName}
                </Link>
              ) : (
                sourceName
              )}{' '}
              crossword{' '}
              {dateHref ? (
                <>
                  on{' '}
                  <Link href={dateHref} className="verba-link text-verba-blue">
                    <time dateTime={puzzleDate}>{puzzleDate}</time>
                  </Link>
                </>
              ) : (
                `on ${puzzleDate}`
              )}
              .
            </span>
          ),
        }
      : null,
    typeof seenInCount === 'number'
      ? {
          q: 'Has this crossword clue appeared before?',
          a:
            seenInCount > 0 ? (
              <span>
                Yes. Variations of this clue have appeared {seenInCount} other
                time{seenInCount === 1 ? '' : 's'}.
              </span>
            ) : (
              <span>This appears to be a rare or unique clue.</span>
            ),
        }
      : null,
  ].filter(Boolean) as { q: string; a: React.ReactNode }[];

  if (faqs.length === 0) return null;

  return (
    <section className="mt-10 rounded-xl border bg-slate-50 p-6">
      <h2 className="text-base font-semibold text-slate-900">
        Frequently asked questions
      </h2>

      <dl className="mt-4 space-y-4 text-sm text-slate-700">
        {faqs.map((f, i) => (
          <div key={i}>
            <dt className="font-medium">{f.q}</dt>
            <dd className="mt-1">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
