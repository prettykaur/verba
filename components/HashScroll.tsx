// components/HashScroll.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function HashScroll() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash?.slice(1);
      if (!hash) return;

      let attempts = 0;
      const maxAttempts = 60; // ~1 second

      const tryScroll = () => {
        const el = document.getElementById(hash);

        if (el) {
          el.scrollIntoView({ block: 'start' });
          el.classList.add('hash-highlight');

          setTimeout(() => {
            el.classList.remove('hash-highlight');
          }, 1200);

          return;
        }

        if (attempts < maxAttempts) {
          attempts++;
          requestAnimationFrame(tryScroll);
        }
      };

      tryScroll();
    };

    // slight delay ensures layout is ready
    setTimeout(scrollToHash, 50);

    // Also listen to hashchange events
    const handleHashChange = () => scrollToHash();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [pathname, searchParams]);

  return null;
}
