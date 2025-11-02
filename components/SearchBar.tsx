'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qs = q.trim();
    if (!qs) return;
    router.push(`/search?q=${encodeURIComponent(qs)}`);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-2xl gap-2">
      <Input
        aria-label="Search crossword answers"
        placeholder="Search by clue, e.g. D?NIM"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="rounded-lg"
      />
      <Button type="submit" className="rounded-lg">
        Search
      </Button>
    </form>
  );
}
