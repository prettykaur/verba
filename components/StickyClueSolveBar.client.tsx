// components/StickyClueSolveBar.client.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { ClueHintActions } from '@/components/ClueHintActions.client';

type Props = {
  clueText: string;
  answer: string;
  answerFrequency?: number;
  otherCluesForSameAnswer?: string[];
  definition?: string | null;
};

const STICKY_HEIGHT = 64; // px — adjust if needed

export function StickyClueSolveBar(props: Props) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting);
      },
      {
        rootMargin: '-64px 0px 0px 0px', // header height
        threshold: 0,
      },
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Anchor + inline solve bar */}
      <div ref={anchorRef}>
        <ClueHintActions {...props} />
      </div>

      {/* Spacer to prevent content overlap */}
      {showSticky && <div style={{ height: STICKY_HEIGHT }} />}

      {/* Sticky bar */}
      {showSticky && (
        <div className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 py-2">
            <ClueHintActions {...props} mode="sticky" />
          </div>
        </div>
      )}
    </>
  );
}
