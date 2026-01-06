// app/contact/page.tsx

import type { Metadata } from 'next';

export const revalidate = 86400; // 1 day

export const metadata: Metadata = {
  title: 'Contact | Verba',
  description:
    'Get in touch with the creator of Verba. Report bugs, request features, or ask questions about crossword clues and answers.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact | Verba',
    description:
      'Get in touch with the creator of Verba. Report bugs, request features, or ask questions about crossword clues and answers.',
    url: 'https://tryverba.com/contact',
    siteName: 'Verba',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact | Verba',
    description:
      'Get in touch with the creator of Verba. Report bugs, request features, or ask questions.',
  },
};

export default function ContactPage() {
  return (
    <>
      <div className="space-y-6">
        <h1 className="mb-4 text-2xl font-bold">Contact</h1>
        <p className="mb-6 text-sm text-slate-600">
          Got a question, bug report, or a feature request for Verba? Send me a
          message and I’ll get back to you as soon as I can.
        </p>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {/* For now this can just be a mailto link */}
          <p className="text-sm text-slate-700">
            You can email me directly at{' '}
            <a
              href="mailto:hello@tryverba.com"
              className="verba-link text-verba-blue"
            >
              hello@tryverba.com
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
