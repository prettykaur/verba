// app/submit/page.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export default function SubmitPage() {
  const [clue, setClue] = useState('');
  const [pattern, setPattern] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedClue = clue.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedClue) {
      setError('Please enter a clue.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      const res = await fetch('/api/submit-clue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clue_text: trimmedClue,
          pattern: pattern.trim() || undefined,
          source_slug: source.trim() || undefined,
          email: trimmedEmail,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setStatus('error');
        setError(json?.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      setClue('');
      setPattern('');
      setSource('');
      setEmail('');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError('Network error. Please try again.');
    }
  }

  return (
    <>
      {/* <main className="mx-auto max-w-3xl px-4 py-10"> */}
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Submit a clue</h1>
        <p className="text-slate-700">
          Missing an answer or see something incorrect? Send us a clue and
          we&apos;ll review it as we improve Verba.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4 rounded-xl border bg-white p-4"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="clue">
              Clue text<span className="text-red-500">*</span>
            </label>
            <Input
              id="clue"
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              placeholder='e.g. "Sushi seaweed"'
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email<span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="pattern">
                Pattern / answer (optional)
              </label>
              <Input
                id="pattern"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder='e.g. "NORI" or "N?RI"'
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="source">
                Source (optional)
              </label>
              <Input
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. nyt-mini"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {status === 'success' && (
            <p className="text-sm text-green-600">
              Thanks! Your clue has been submitted.
            </p>
          )}

          <Button
            type="submit"
            disabled={status === 'submitting'}
            className="rounded-lg"
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit clue'}
          </Button>
        </form>

        <p className="text-xs text-slate-500">
          By submitting, you confirm you have the right to share this clue and
          understand it may be used to improve Verba.
        </p>
      </section>
      {/* </main> */}
    </>
  );
}
