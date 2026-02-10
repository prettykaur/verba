// lib/formatDate.ts

function parseUTCDate(iso: string) {
  // Force UTC midnight to avoid timezone drift
  return new Date(`${iso}T00:00:00Z`);
}

export function formatPuzzleDateLong(iso: string): string {
  const date = parseUTCDate(iso);

  const weekday = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    timeZone: 'UTC',
  });
  const day = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    timeZone: 'UTC',
  });
  const month = date.toLocaleDateString('en-GB', {
    month: 'long',
    timeZone: 'UTC',
  });
  const year = date.getUTCFullYear();

  return `${weekday}, ${day} ${month} ${year}`;
}

export function formatPuzzleDateShort(iso: string): string {
  const date = parseUTCDate(iso);

  const day = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    timeZone: 'UTC',
  });
  const month = date.toLocaleDateString('en-GB', {
    month: 'short',
    timeZone: 'UTC',
  });
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}
