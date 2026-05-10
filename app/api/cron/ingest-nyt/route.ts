// app/api/cron/ingest-nyt/route.ts
import { NextResponse } from 'next/server';
import { ingestNytMini } from '@/scripts/ingest/nytMini';
import { ingestNytCrossword } from '@/scripts/ingest/nytCrossword';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  try {
    results.mini = await ingestNytMini();
  } catch (error: unknown) {
    results.mini = { ok: false, error: getErrorMessage(error) };
  }

  try {
    results.crossword = await ingestNytCrossword();
  } catch (error: unknown) {
    results.crossword = { ok: false, error: getErrorMessage(error) };
  }

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    results,
  });
}
