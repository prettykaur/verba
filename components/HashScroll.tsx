// components/HashScroll.tsx
'use client';

import { useEffect } from 'react';

export function HashScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash?.slice(1); // drop the '#'
    if (!hash) return;

    const el = document.getElementById(hash);
    if (!el) return;

    // Scroll to the element (respecting scroll-mt-24)
    el.scrollIntoView({ block: 'start', behavior: 'smooth' });

    // Add temporary highlight
    el.classList.add('hash-highlight');

    // Optional: remove the class after the animation finishes
    const timeout = window.setTimeout(() => {
      el.classList.remove('hash-highlight');
    }, 1200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return null;
}
