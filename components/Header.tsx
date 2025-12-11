// components/Header.tsx
import Link from 'next/link';
import { Button } from './ui/Button';

export function Header() {
  return (
    <header className="border-brand-slate-200 sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        {/* Left: logo / brand */}
        <Link href="/" className="verba-link font-semibold">
          Verba
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
