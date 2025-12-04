// components/Highlight.tsx
import * as React from 'react';

type HighlightProps = {
  text: string;
  query: string;
};

export function Highlight({ text, query }: HighlightProps) {
  if (!text || !query) return <>{text}</>;

  // don't highlight when using pattern mode (D?NIM, C*T, etc.)
  if (/[?*]/.test(query)) {
    return <>{text}</>;
  }

  // escape regex specials
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // split query into words
  const words = query
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .map(esc)
    .join('|');

  if (!words) return <>{text}</>;

  const regex = new RegExp(`(${words})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        // odd indices are the matched substrings
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-verba-amber/30 px-0.5 py-[1px]">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}
