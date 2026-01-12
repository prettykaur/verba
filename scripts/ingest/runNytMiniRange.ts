// scripts/ingest/runNytMiniRange.ts
import { ingestNytMini } from './nytMini';
import { dateRangeInclusive, sleep, isISODate } from './utils';
import { logIngestFailure } from './logFailure';

type Result = { date: string; ok: boolean; inserted?: number; error?: string };

function getArg(prefix: string): string | null {
  const arg = process.argv.find((a) => a.startsWith(prefix));
  if (!arg) return null;
  const [, value] = arg.split('=');
  return value ?? null;
}

async function main() {
  const start = process.argv[2];
  const end = process.argv[3];

  if (!start || !end) {
    throw new Error(
      'Usage: pnpm ingest:nyt-mini:range YYYY-MM-DD YYYY-MM-DD [--delay=900]',
    );
  }
  if (!isISODate(start) || !isISODate(end)) {
    throw new Error('Start/end must be YYYY-MM-DD');
  }

  const delayMs = Number(getArg('--delay') ?? '750');

  console.log('Range ingest:', { start, end, delayMs });

  const results: Result[] = [];

  for (const date of dateRangeInclusive(start, end)) {
    try {
      const r: any = await ingestNytMini(date);
      results.push({ date, ok: true, inserted: r?.inserted });
      console.log(`✅ ${date} ok (inserted ${r?.inserted ?? '?'})`);
    } catch (e: any) {
      const msg = e?.message ?? String(e);

      results.push({ date, ok: false, error: msg });
      console.error(`❌ ${date} failed:`, msg);

      await logIngestFailure({
        sourceSlug: 'nyt-mini',
        puzzleDate: date,
        stage: 'range_ingest',
        error: msg,
      });
    }

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  const failCount = results.length - okCount;

  console.log(`Done. ok=${okCount}, failed=${failCount}`);

  if (failCount > 0) {
    console.log('Failed dates:');
    for (const r of results.filter((x) => !x.ok)) {
      console.log(`- ${r.date}: ${r.error}`);
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('❌ Range ingest crashed:', err);
  process.exit(1);
});
