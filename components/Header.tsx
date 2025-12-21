// components/Header.tsx
import Link from 'next/link';
import { Button } from './ui/Button';
import Image from 'next/image';

export function Header() {
  return (
    <header className="border-brand-slate-200 sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
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
          <Link href="/browse" className="verba-link">
            Browse
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
        </div>
      </div>
    </header>
  );
}
