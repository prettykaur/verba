// components/Header.tsx

'use client';

import Link from 'next/link';
import { Button } from './ui/Button';
import Image from 'next/image';
import { useState } from 'react';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-brand-slate-200 relative sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        {/* Left: logo / brand */}
        <Link
          href="/"
          aria-label="Verba Home"
          className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 transition hover:bg-verba-cream/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verba-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.99]"
        >
          {/* Mobile: icon only */}
          <span className="inline-flex items-center md:hidden">
            <Image
              src="/branding/verba-icon.svg"
              alt=""
              aria-hidden="true"
              width={26}
              height={26}
              priority
              className="block"
            />
          </span>

          {/* Desktop: full logo */}
          <span className="hidden items-center md:inline-flex">
            <Image
              src="/branding/verba-logo.svg"
              alt=""
              aria-hidden="true"
              width={120}
              height={32}
              priority
              className="block"
            />
          </span>
        </Link>

        {/* Center: primary nav (desktop) */}
        <nav className="hidden items-center gap-5 text-sm md:flex">
          <Link href="/search" className="verba-link">
            Search
          </Link>
          <Link href="/answers" className="verba-link">
            Answers
          </Link>
          <Link href="/answers/common" className="verba-link">
            Common Answers
          </Link>
          <Link href="/faq" className="verba-link">
            FAQ
          </Link>
        </nav>

        {/* Right: Today + CTA */}
        <div className="flex items-center gap-3">
          {/* Today link (desktop only for now) */}
          <Link
            href="/answers/nyt-mini/today"
            className="verba-link hidden text-sm text-verba-blue md:inline"
          >
            Today
          </Link>

          <Link href="/submit">
            <Button
              variant="secondary"
              size="sm"
              className="btn-marigold-hover card-lift"
            >
              Submit a clue
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="sm"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md px-2 py-1 text-lg hover:bg-verba-cream/70 md:hidden"
          >
            ☰
          </Button>
        </div>
      </div>

      {open && (
        <div className="absolute right-4 top-full z-50 mt-2 rounded-lg border border-slate-200 bg-white shadow-md md:hidden">
          <nav className="flex flex-col text-sm">
            <Link
              href="/search"
              className="px-4 py-2 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Search
            </Link>
            <Link
              href="/answers"
              className="px-4 py-2 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Answers
            </Link>
            <Link
              href="/answers/common"
              className="px-4 py-2 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Common Answers
            </Link>
            <Link
              href="/faq"
              className="px-4 py-2 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/answers/nyt-mini/today"
              className="px-4 py-2 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Today
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
