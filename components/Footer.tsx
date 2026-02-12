// components/Footer.tsx
import Link from 'next/link';
import { EmailSubscribe } from '@/components/EmailSubscribe';

export function Footer() {
  return (
    <footer className="border-brand-slate-200 mt-16 border-t bg-white">
      <div className="text-brand-slate-600 mx-auto max-w-3xl px-4 py-8 text-sm">
        {/* Newsletter */}
        <div className="mb-6 space-y-3">
          <p className="text-sm font-medium text-slate-900">Stay in the loop</p>
          <EmailSubscribe source="footer" />
        </div>

        {/* Explore links */}
        <div className="border-brand-slate-200 mt-8 flex flex-wrap items-center gap-4 border-t pt-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium tracking-wide text-slate-900">
                Explore
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/answers" className="verba-link">
                    Puzzle Sources
                  </Link>
                </li>
                <li>
                  <Link href="/answers/common" className="verba-link">
                    Common Answers
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="verba-link">
                    Search Clues
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium tracking-wide text-slate-900">
                Common Lengths
              </p>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/answers/common/length/3-letter"
                    className="verba-link"
                  >
                    3-Letter Answers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/answers/common/length/4-letter"
                    className="verba-link"
                  >
                    4-Letter Answers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/answers/common/length/5-letter"
                    className="verba-link"
                  >
                    5-Letter Answers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal / utility */}
        <div className="border-brand-slate-200 mt-8 flex flex-wrap items-center gap-4 border-t pt-6">
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
