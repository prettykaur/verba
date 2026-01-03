// app/about/page.tsx
import type { Metadata } from 'next';

export const revalidate = 3600; // 1h

export const metadata: Metadata = {
  title: 'About Verba | Fast Crossword Answers',
  description:
    'Verba is a clean, fast way to look up crossword clues and answers. Simple pages, helpful SEO schema, and quick navigation to daily puzzles.',
  alternates: { canonical: 'https://tryverba.com/about' },
  openGraph: {
    title: 'About Verba | Fast Crossword Answers',
    description:
      'Verba is a clean, fast way to look up crossword clues and answers.',
    url: 'https://tryverba.com/about',
    siteName: 'Verba',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About Verba',
    description: 'Fast clue lookups.',
  },
};

export default function AboutPage() {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Verba',
    url: 'https://tryverba.com/',
    logo: 'https://tryverba.com/icon.png',
  };

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <h1 className="text-2xl font-bold">About Verba</h1>
      <p className="mt-3 text-slate-700">
        Verba is a clean, fast way to look up crossword clues and answers. We
        focus on speedy pages, sensible formatting, and helpful internal links
        so you can jump directly to the day and source you need.
      </p>

      <h2 className="mt-6 text-lg font-semibold">How it works</h2>
      <ul className="mt-2 list-disc pl-5 text-slate-700">
        <li>
          Browse by <strong>source</strong> and <strong>date</strong>.
        </li>
        <li>See concise clue → answer lists (no fluff or spoilers).</li>
        <li>
          Structured data (FAQ/Breadcrumbs/Article) helps search engines surface
          the right page.
        </li>
      </ul>

      <h2 className="mt-6 text-lg font-semibold">What we index</h2>
      <p className="mt-2 text-slate-700">
        We provide safe clue/answer references and metadata. We don’t host or
        republish licensed grids. For official puzzles, please support their
        publishers.
      </p>

      <h2 className="mt-6 text-lg font-semibold">Contact</h2>
      <p className="mt-2 text-slate-700">
        Feature request or correction? Email{' '}
        <a
          className="verba-link text-verba-blue"
          href="mailto:hello@tryverba.com"
        >
          hello@tryverba.com
        </a>
        .
      </p>
    </div>
  );
}
