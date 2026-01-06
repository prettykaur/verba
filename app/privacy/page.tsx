// app/privacy/page.tsx
import type { Metadata } from 'next';

export const revalidate = 86400; // 1 day

export const metadata: Metadata = {
  title: 'Privacy Policy | Verba',
  description:
    'Learn how Verba handles basic usage data, search queries, and submissions.',
  alternates: { canonical: 'https://tryverba.com/privacy' },
  openGraph: {
    title: 'Privacy Policy | Verba',
    description:
      'Information about how Verba handles basic usage data and submissions.',
    url: 'https://tryverba.com/privacy',
    siteName: 'Verba',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Verba',
    description: 'How Verba handles basic usage data and submissions.',
  },
};

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="text-slate-700">
        This is a simple crossword helper site. We collect as little data as
        reasonably possible to keep things working and understand basic usage.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">What we collect</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          <li>
            <strong>Server logs:</strong> Basic technical logs from our hosting
            provider (e.g., IP address, browser type) to keep the site secure.
          </li>
          <li>
            <strong>Search queries:</strong> We may record anonymised search
            queries to understand which clues and answers are most useful.
          </li>
          <li>
            <strong>Submissions:</strong> If you submit a clue or contact us, we
            store what you send so we can review it.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Cookies & analytics</h2>
        <p className="text-slate-700">
          We may use lightweight analytics tools to understand aggregate usage
          patterns (for example, which pages are most visited). These tools are
          configured, where possible, to avoid collecting personally
          identifiable information.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Email & contact</h2>
        <p className="text-slate-700">
          If you email us or subscribe via a newsletter form, we will store your
          email address for the purpose of replying or sending updates you have
          requested. You can opt out at any time by contacting us.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Third-party services</h2>
        <p className="text-slate-700">
          Verba is hosted and powered by third-party providers such as Vercel
          and Supabase. These providers may process data on our behalf to
          deliver the service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Contact</h2>
        <p className="text-slate-700">
          If you have privacy questions, email{' '}
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
