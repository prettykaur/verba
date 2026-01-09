// components/RevealAnswer.tsx

'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';

type RevealAnswerProps = {
  answer: string;
  size?: 'sm' | 'md' | 'lg';
  startRevealed?: boolean;
  version?: number;
  maskLength?: number;
  eventProps?: Record<string, string | number | boolean>;
};

export function RevealAnswer({
  answer,
  size = 'md',
  startRevealed = false,
  version,
  maskLength,
  eventProps,
}: RevealAnswerProps) {
  const [revealed, setRevealed] = useState(startRevealed);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setRevealed(startRevealed);
    setCopied(false);
  }, [startRevealed, version]);

  const cleanedLen = (answer ?? '').replace(/[^A-Za-z]/g, '').length;

  const dotsLen =
    typeof maskLength === 'number'
      ? Math.max(maskLength, 1)
      : Math.max(cleanedLen || 3, 3);

  const placeholderDots = '•'.repeat(dotsLen);

  let textSize = 'text-base';
  if (size === 'sm') textSize = 'text-sm';
  if (size === 'lg') textSize = 'text-xl';

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);

      track('copy_answer', {
        answer_len: cleanedLen,
        ...eventProps,
      });

      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = answer;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          const next = !revealed;

          track('reveal_answer_toggle', {
            to: next ? 'shown' : 'hidden',
            answer_len: cleanedLen,
            ...eventProps,
          });

          setRevealed(next);
          if (!next) setCopied(false);
        }}
        className={`btn-marigold-hover btn-press inline-flex items-center justify-center rounded-md border px-3 py-1 font-mono uppercase tracking-[0.07em] ${textSize}`}
        aria-pressed={revealed}
        aria-label={revealed ? 'Hide answer' : 'Show answer'}
      >
        {revealed ? answer || '—' : placeholderDots}
      </button>

      {revealed && (
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
          aria-live="polite"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  );
}
