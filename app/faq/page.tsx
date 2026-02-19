// app/faq/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { buildBreadcrumb } from '@/lib/schema';

export const revalidate = 3600; // 1h

export const metadata: Metadata = {
  title: 'FAQ | Verba',
  description:
    'Answers to common questions about Verba: sources, coverage, how to find daily pages, and how to request new features.',
  alternates: { canonical: 'https://tryverba.com/faq' },
  openGraph: {
    title: 'FAQ | Verba',
    description:
      'Answers to common questions about Verba: sources, coverage, daily pages, and feature requests.',
    url: 'https://tryverba.com/faq',
    siteName: 'Verba',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'FAQ | Verba',
    description: 'Common questions about Verba.',
  },
};

const faqs = [
  {
    q: 'Where do your answers come from?',
    a: 'From public sources and safe seed data. We do not host or republish licensed puzzle grids.',
  },
  {
    q: 'How do I find a specific day’s answers?',
    a: "Go to Answers, pick a source, then select a date. You can also use the 'Today' link for the current edition.",
  },
  {
    q: 'Do you support NYT Mini?',
    a: 'We provide concise clue/answer references and safe metadata for common sources like the NYT Mini.',
  },
  {
    q: "Why does a page say 'No data for this date yet'?",
    a: 'That date may not be available yet. Try an adjacent day or browse recent dates from the source index.',
  },
  {
    q: 'How fast are pages updated?',
    a: 'We aim for fast updates; availability depends on the source. Core pages refresh hourly or on-demand.',
  },
  {
    q: 'Can I request a new source?',
    a: 'Yes! Email hello@tryverba.com with details. We’ll review feasibility and licensing considerations.',
  },
];

export default function FAQPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  const breadcrumb = buildBreadcrumb([
    { name: 'Home', url: 'https://tryverba.com' },
    {
      name: 'FAQ',
      url: 'https://tryverba.com/faq',
    },
  ]);

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <h1 className="text-2xl font-bold">FAQ</h1>
      <ul className="mt-6 space-y-4">
        {faqs.map(({ q, a }) => {
          const isRequestFaq = q === 'Can I request a new source?';

          const isFindDayFaq = q === 'How do I find a specific day’s answers?';

          const isNytMiniFaq = q === 'Do you support NYT Mini?';

          return (
            <li key={q} className="rounded-lg border bg-white p-4">
              <h2 className="font-semibold">{q}</h2>
              <p className="mt-1 text-slate-700">
                {isRequestFaq ? (
                  <>
                    Yes! Email{' '}
                    <a
                      href="mailto:hello@tryverba.com"
                      className="verba-link text-verba-blue"
                    >
                      hello@tryverba.com
                    </a>{' '}
                    with details. We’ll review feasibility and licensing
                    considerations.
                  </>
                ) : isFindDayFaq ? (
                  <>
                    Go to{' '}
                    <Link
                      href="/answers"
                      className="verba-link text-verba-blue"
                    >
                      Answers
                    </Link>
                    , pick a source, then select a date. You can also use the{' '}
                    <Link
                      href="/answers/nyt-mini/today"
                      className="verba-link text-verba-blue"
                    >
                      Today
                    </Link>{' '}
                    link for the current edition.
                  </>
                ) : isNytMiniFaq ? (
                  <>
                    We provide concise clue/answer references and safe metadata
                    for common sources like the{' '}
                    <Link
                      href="/answers/nyt-mini"
                      className="verba-link text-verba-blue"
                    >
                      NYT Mini
                    </Link>
                    .
                  </>
                ) : (
                  a
                )}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 text-slate-700">
        See also:{' '}
        <Link className="verba-link text-verba-blue" href="/answers">
          Answers
        </Link>{' '}
        and{' '}
        <Link
          className="verba-link text-verba-blue"
          href="/answers/nyt-mini/today"
        >
          Today’s NYT Mini
        </Link>
        .
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb),
        }}
      />
    </div>
  );
}
