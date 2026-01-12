// scripts/ingest/logFailure.ts
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export async function logIngestFailure(args: {
  sourceSlug: string;
  puzzleDate: string;
  stage: string;
  error: string;
  details?: unknown;
}) {
  try {
    const SUPABASE_URL = mustGetEnv('NEXT_PUBLIC_SUPABASE_URL');
    const SERVICE_ROLE = mustGetEnv('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Try insert with details first
    const withDetails = await supabase.from('ingest_failure').insert({
      source_slug: args.sourceSlug,
      puzzle_date: args.puzzleDate,
      stage: args.stage,
      message: args.error,
      details: args.details ?? null,
    });

    if (!withDetails.error) return;

    // If schema doesn’t have details column, fallback to minimal insert
    const fallback = await supabase.from('ingest_failure').insert({
      source_slug: args.sourceSlug,
      puzzle_date: args.puzzleDate,
      stage: args.stage,
      message: args.error,
    });

    if (fallback.error) {
      console.warn('⚠️ Failed to log ingest failure:', fallback.error.message);
    }
  } catch (e: any) {
    console.warn('⚠️ logIngestFailure crashed:', e?.message ?? String(e));
  }
}
