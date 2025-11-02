import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-brand-slate-200 mt-16 border-t bg-white">
      <div className="text-brand-slate-600 mx-auto max-w-3xl px-4 py-8 text-sm">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
        <p className="mt-3">© {new Date().getFullYear()} Verba</p>
      </div>
    </footer>
  );
}
