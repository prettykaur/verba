// components/Header.tsx
import Link from 'next/link';
import { Button } from './ui/Button';

export function Header() {
  return (
    <header className="border-brand-slate-200 sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="verba-link font-semibold">
          Verba
        </Link>
        <nav className="hidden gap-5 text-sm md:flex">
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
        <div className="flex items-center gap-2 hover:bg-slate-50">
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
