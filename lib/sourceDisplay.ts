// lib/sourceDisplay.ts

export const SOURCE_DISPLAY: Record<string, string> = {
  'nyt-mini': 'NYT Mini',
  'la-times': 'LA Times',
  guardian: 'The Guardian',
  'usa-today': 'USA Today',
  seed: 'Classic Crossword Clues',
};

export function getSourceDisplay(slug: string) {
  return SOURCE_DISPLAY[slug] ?? slug;
}
