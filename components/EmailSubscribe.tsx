// components/EmailSubscribe.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function EmailSubscribe({ source }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Please enter a valid email.');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error);
      }

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-3 sm:flex-row"
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Get crossword tips in your inbox"
          required
          className="flex-1"
        />

        <Button
          type="submit"
          disabled={status === 'loading'}
          className="w-full sm:w-auto"
        >
          {status === 'loading' ? '…' : 'Subscribe'}
        </Button>
      </form>

      {status === 'success' && (
        <p className="mt-2 text-sm text-green-600">Subscribed!</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </>
  );
}
