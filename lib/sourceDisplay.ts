// lib/sourceDisplay.ts

export const SOURCE_DISPLAY: Record<string, string> = {
  'nyt-mini': 'NYT Mini',
  'nyt-midi': 'NYT Midi',
  'nyt-crossword': 'NYT Crossword',
  'la-times': 'LA Times',
  guardian: 'The Guardian',
  'usa-today': 'USA Today',
  seed: 'Classic Crossword Clues',
};

export function getSourceDisplay(slug: string): string {
  return SOURCE_DISPLAY[slug] ?? slug;
}

/**
 * Helper for pages that may already have a DB-provided source_name.
 * DB name wins, otherwise fall back to display map.
 */
export function resolveSourceName(
  slug: string,
  dbName?: string | null,
): string {
  return dbName ?? getSourceDisplay(slug);
}
