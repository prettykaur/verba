// lib/formatDate.ts
export function formatPuzzleDateLong(iso: string): string {
  const date = new Date(iso);

  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' }); // Monday
  const day = date.toLocaleDateString('en-GB', { day: '2-digit' }); // 08
  const month = date.toLocaleDateString('en-GB', { month: 'long' }); // December
  const year = date.getFullYear(); // 2025

  return `${weekday}, ${day} ${month} ${year}`;
}

export function formatPuzzleDateShort(iso: string): string {
  const date = new Date(iso);

  const day = date.toLocaleDateString('en-GB', { day: '2-digit' }); // 08
  const month = date.toLocaleDateString('en-GB', { month: 'short' }); // Dec
  const year = date.getFullYear(); // 2025

  return `${day} ${month} ${year}`;
}
