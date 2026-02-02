// lib/quickClueSlug.ts

const NUM_WORDS: Record<string, string> = {
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
  '10': 'ten',
  '11': 'eleven',
  '12': 'twelve',
};

const WORD_NUMS: Record<string, number> = Object.fromEntries(
  Object.entries(NUM_WORDS).map(([n, w]) => [w, Number(n)]),
);

function slugifyPhrase(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '') // strip punctuation
    .replace(/\s+/g, '-') // spaces -> dashes
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-|-$/g, ''); // trim dashes
}

export function encodeQuickClueSlug(phrase: string, answerLen?: number | null) {
  const clean = slugifyPhrase(phrase);
  if (!clean) return 'crossword-clue-answer';

  if (answerLen && answerLen >= 2 && answerLen <= 12) {
    return `${answerLen}-letter-word-for-${clean}`;
  }
  return `${clean}-clue-crossword-answer`;
}

export function decodeQuickClueSlug(slug: string): {
  phrase: string;
  answerLen: number | null;
} {
  const s = slug.trim().toLowerCase();

  // Pattern: "4-letter-word-for-bird-of-prey"
  const m = s.match(/^(\d+)-letter-word-for-(.+)$/);
  if (m) {
    const n = Number(m[1]);
    const phrase = (m[2] ?? '').replace(/-/g, ' ').trim();
    return { phrase, answerLen: Number.isFinite(n) ? n : null };
  }

  // Pattern: "four-letter-word-for-bird-of-prey"
  const m2 = s.match(/^([a-z]+)-letter-word-for-(.+)$/);
  if (m2) {
    const n = WORD_NUMS[m2[1]] ?? null;
    const phrase = (m2[2] ?? '').replace(/-/g, ' ').trim();
    return { phrase, answerLen: n };
  }

  // Pattern: "{phrase}-clue-crossword-answer"
  const m3 = s.match(/^(.+)-clue-crossword-answer$/);
  if (m3) {
    const phrase = (m3[1] ?? '').replace(/-/g, ' ').trim();
    return { phrase, answerLen: null };
  }

  // Fallback: treat entire slug as phrase
  return { phrase: s.replace(/-/g, ' ').trim(), answerLen: null };
}
