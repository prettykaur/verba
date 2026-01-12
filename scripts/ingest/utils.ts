// scripts/ingest/utils.ts
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function parseISODateToUTC(dateStr: string): Date {
  // Ensure UTC interpretation (avoid local timezone surprises)
  // dateStr must be YYYY-MM-DD
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatUTCDateOnly(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function* dateRangeInclusive(start: string, end: string) {
  const startD = parseISODateToUTC(start);
  const endD = parseISODateToUTC(end);

  if (startD.getTime() > endD.getTime()) {
    throw new Error(`Start date ${start} is after end date ${end}`);
  }

  for (let d = startD; d.getTime() <= endD.getTime(); ) {
    yield formatUTCDateOnly(d);
    d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
  }
}
