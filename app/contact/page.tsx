// app/contact/page.tsx
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-bold">Contact</h1>
        <p className="mb-6 text-sm text-slate-600">
          Got a question, bug report, or a feature request for Verba? Send me a
          message and I’ll get back to you as soon as I can.
        </p>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {/* For now this can just be a mailto link;
              you can swap to a real form + API route later. */}
          <p className="text-sm text-slate-700">
            You can email me directly at{' '}
            <a
              href="mailto:hello@verba.app"
              className="font-semibold underline decoration-amber-400"
            >
              hello@verba.app
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
