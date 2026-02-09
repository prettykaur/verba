// lib/quickClueSlug.ts

const NUMBER_WORDS: Record<string, number> = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

export function decodeQuickClueSlug(slug: string): {
  phrase: string | null;
  answerLen: number | null;
} {
  let s = slug.toLowerCase();

  // 1️⃣ Strip known suffixes
  s = s.replace(/-clue-crossword-answer$/, '');
  s = s.replace(/-crossword-answer$/, '');

  // 2️⃣ Detect length-based pattern
  // e.g. "4-letter-word-for-bird-of-prey"
  const lenMatch = s.match(
    /^(\d+|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)-letter-word-for-(.+)$/i,
  );

  if (lenMatch) {
    const rawLen = lenMatch[1];
    const phrase = lenMatch[2].replace(/-/g, ' ').trim();

    const answerLen = /^\d+$/.test(rawLen)
      ? Number(rawLen)
      : NUMBER_WORDS[rawLen];

    return {
      phrase: phrase || null,
      answerLen: answerLen ?? null,
    };
  }

  // 3️⃣ Fallback: treat entire slug as clue phrase
  const phrase = s.replace(/-/g, ' ').trim();

  return {
    phrase: phrase.length > 0 ? phrase : null,
    answerLen: null,
  };
}

export function encodeQuickClueSlug(phrase: string, answerLen?: number | null) {
  const base = phrase
    .toLowerCase()
    .trim()
    // convert punctuation into spaces (NOT deletion)
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (answerLen && answerLen > 0) {
    return `${answerLen}-letter-word-for-${base}`;
  }

  return base;
}
