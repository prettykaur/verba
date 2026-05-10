// app/api/cron/ingest-nyt/route.ts
import { NextResponse } from 'next/server';
import { ingestNytMini } from '@/scripts/ingest/nytMini';
import { ingestNytCrossword } from '@/scripts/ingest/nytCrossword';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  try {
    results.mini = await ingestNytMini();
  } catch (e: any) {
    results.mini = { ok: false, error: e?.message ?? String(e) };
  }

  try {
    results.crossword = await ingestNytCrossword();
  } catch (e: any) {
    results.crossword = { ok: false, error: e?.message ?? String(e) };
  }

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    results,
  });
}
