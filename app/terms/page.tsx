// app/terms/page.tsx
import type { Metadata } from 'next';

export const revalidate = 86400; // 1 day

export const metadata: Metadata = {
  title: 'Terms of Use | Verba',
  description:
    'Simple terms of use for Verba, a crossword clue and answer helper.',
  alternates: { canonical: 'https://tryverba.com/terms' },
  openGraph: {
    title: 'Terms of Use | Verba',
    description:
      'Simple terms of use for Verba, a crossword clue and answer helper.',
    url: 'https://tryverba.com/terms',
    siteName: 'Verba',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Use | Verba',
    description: 'Simple terms of use for Verba.',
  },
};

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Terms of Use</h1>
      <p className="text-slate-700">
        Verba is a small crossword helper built for convenience and education.
        By using this site, you agree to these simple terms.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">No warranties</h2>
        <p className="text-slate-700">
          We do our best to provide accurate clue and answer information, but we
          cannot guarantee completeness or correctness. Use Verba at your own
          risk and always refer to the original puzzle source for definitive
          answers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Intellectual property</h2>
        <p className="text-slate-700">
          We do not host or republish full licensed grids. References to
          third-party trademarks, publishers, or titles are for identification
          purposes only and remain the property of their respective owners.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Acceptable use</h2>
        <p className="text-slate-700">
          You agree not to misuse the site, attempt to scrape it excessively, or
          use it in ways that would overload or disrupt the service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Changes</h2>
        <p className="text-slate-700">
          These terms may be updated occasionally. Continued use of the site
          after changes are published means you accept the updated terms.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Contact</h2>
        <p className="text-slate-700">
          Questions about these terms? Email{' '}
          <a
            className="verba-link text-verba-blue"
            href="mailto:hello@tryverba.com"
          >
            hello@tryverba.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
