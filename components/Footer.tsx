// components/Footer.tsx
import Link from 'next/link';
import { EmailSubscribe } from '@/components/EmailSubscribe';

export function Footer() {
  return (
    <footer className="border-brand-slate-200 mt-16 border-t bg-white">
      <div className="text-brand-slate-600 mx-auto max-w-3xl px-4 py-8 text-sm">
        <div className="mb-6 space-y-3">
          <p className="text-sm font-medium text-slate-900">Stay in the loop</p>
          <EmailSubscribe source="footer" />
        </div>

        <div className="border-brand-slate-200 flex flex-wrap items-center gap-4 border-t pt-4">
          <Link href="/about" className="verba-link">
            About
          </Link>
          <Link href="/faq" className="verba-link">
            FAQ
          </Link>
          <Link href="/privacy" className="verba-link">
            Privacy
          </Link>
          <Link href="/terms" className="verba-link">
            Terms
          </Link>
          <Link href="/contact" className="verba-link">
            Contact
          </Link>
          <Link href="/sitemap" className="verba-link">
            Sitemap
          </Link>
        </div>
        <p className="mt-3">© {new Date().getFullYear()} Verba</p>
      </div>
    </footer>
  );
}
