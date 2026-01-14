// scripts/ingest/nytMini.ts
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { logIngestFailure } from './logFailure';
import crypto from 'node:crypto';

type Dir = 'across' | 'down';

function md5(s: string): string {
  return crypto.createHash('md5').update(s, 'utf8').digest('hex');
}

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

function toISODateOnly(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateArg(dateArg?: string): string {
  if (!dateArg) return toISODateOnly(new Date());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateArg)) {
    throw new Error(`Invalid date "${dateArg}". Use YYYY-MM-DD.`);
  }
  return dateArg;
}

function normalizeDir(direction: string): Dir {
  const d = direction.trim().toLowerCase();
  if (d === 'across') return 'across';
  if (d === 'down') return 'down';
  throw new Error(`Unknown direction: ${direction}`);
}

function cluePlainText(textArr: any): string {
  const t0 = Array.isArray(textArr) ? textArr[0] : null;
  const plain = t0?.plain ?? t0?.formatted ?? '';
  return String(plain).trim();
}

// Extract leading number from "5D", "5", "05", etc
function parseClueNumber(label: string): number {
  const m = label.trim().match(/^(\d+)/);
  if (!m) return NaN;
  return Number.parseInt(m[1], 10);
}

function generateEnumerationFromRaw(answerRaw: string): string {
  const parts = answerRaw
    .trim()
    .split(/[^A-Za-z]+/g)
    .filter(Boolean);

  if (parts.length === 0) {
    return String(answerRaw.replace(/[^A-Za-z]/g, '').length);
  }
  return parts.map((p) => String(p.length)).join(',');
}

function normalizeAnswerToLetters(answerRaw: string): string {
  return answerRaw.replace(/[^A-Za-z]/g, '').toUpperCase();
}

export async function ingestNytMini(
  dateArg?: string,
  opts?: { dryRun?: boolean; keepStaging?: boolean; debug?: boolean },
) {
  const dryRun = !!opts?.dryRun;
  const keepStaging = !!opts?.keepStaging;
  const debug = !!opts?.debug;

  const SUPABASE_URL = mustGetEnv('NEXT_PUBLIC_SUPABASE_URL');
  const SERVICE_ROLE = mustGetEnv('SUPABASE_SERVICE_ROLE_KEY');
  const NYT_COOKIE = process.env.NYT_COOKIE;

  const date = parseDateArg(dateArg);
  const url = `https://www.nytimes.com/svc/crosswords/v6/puzzle/mini/${date}.json`;

  const res = await fetch(url, {
    headers: {
      'user-agent': 'verba-ingest/1.0',
      accept: 'application/json',
      ...(NYT_COOKIE ? { cookie: NYT_COOKIE } : {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    await logIngestFailure({
      sourceSlug: 'nyt-mini',
      puzzleDate: date,
      stage: 'fetch',
      error: `NYT fetch failed ${res.status} ${res.statusText}`,
      details: { url, body: body.slice(0, 500) },
    });
    throw new Error(
      `NYT fetch failed ${res.status} ${res.statusText}\nURL: ${url}\nBody: ${body.slice(0, 500)}`,
    );
  }

  const payload: any = await res.json();
  const puzzle = payload?.body?.[0];
  if (!puzzle) {
    await logIngestFailure({
      sourceSlug: 'nyt-mini',
      puzzleDate: date,
      stage: 'parse',
      error: 'Unexpected NYT payload: missing body[0]',
      details: { url },
    });
    throw new Error('Unexpected NYT payload: missing body[0]');
  }

  const sourceSlug = 'nyt-mini';
  const puzzleDate: string = payload.publicationDate ?? date;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Build per-cell letters (fallback)
  const cellLetters: string[] = (puzzle.cells ?? []).map((c: any) =>
    String(c?.answer ?? '').toUpperCase(),
  );

  const clues: any[] = puzzle.clues ?? [];
  if (!Array.isArray(clues) || clues.length === 0) {
    await logIngestFailure({
      sourceSlug,
      puzzleDate,
      stage: 'parse',
      error: 'Unexpected NYT payload: missing clues[]',
      details: { url },
    });
    throw new Error('Unexpected NYT payload: missing clues[]');
  }

  if (debug) {
    console.log(
      'DEBUG clue labels:',
      clues.map((c: any) => ({
        label: c?.label,
        direction: c?.direction,
        hasCells: Array.isArray(c?.cells) ? c.cells.length : null,
        text: cluePlainText(c?.text),
      })),
    );
  }

  // Don’t filter by cells; some puzzles have weird cell arrays — we can reconstruct answers
  const expected = clues.filter((clueObj: any) => {
    const dir = String(clueObj?.direction ?? '').trim();
    const label = String(clueObj?.label ?? '').trim();
    const txt = cluePlainText(clueObj?.text);
    return dir && label && txt;
  });

  const failures: any[] = [];
  const rows: any[] = [];

  for (const clueObj of expected) {
    try {
      const label = String(clueObj?.label ?? '').trim();
      const number = parseClueNumber(label);
      if (Number.isNaN(number)) throw new Error(`Bad label "${label}"`);

      const dir: Dir = normalizeDir(String(clueObj?.direction ?? ''));
      const clueText = cluePlainText(clueObj?.text);

      const cellIdxs: number[] = Array.isArray(clueObj?.cells)
        ? clueObj.cells
        : [];

      const answerRawFromApi =
        typeof clueObj?.answer === 'string' ? clueObj.answer : '';

      const answerRaw =
        answerRawFromApi.trim() ||
        cellIdxs
          .map((i) => cellLetters[i] ?? '')
          .join('')
          .toUpperCase();

      const answer = normalizeAnswerToLetters(answerRaw);
      if (!clueText) throw new Error('Missing clue text');
      if (!answer) throw new Error('Missing answer');

      const enumeration = generateEnumerationFromRaw(answerRaw);
      const sourceUrl = `https://www.nytimes.com/crosswords/game/mini/${puzzleDate}`;

      const clueMd5 = md5(clueText);
      const clueReadable = clueText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      rows.push({
        source_slug: sourceSlug,
        puzzle_date: puzzleDate,
        number,
        direction: dir,
        clue_text: clueText,
        answer,
        enumeration,
        enumeration_source: 'derived',
        source_url: sourceUrl,
        slug_md5: clueMd5,
        slug_readable: clueReadable,
      });
    } catch (e: any) {
      failures.push({
        label: clueObj?.label ?? null,
        direction: clueObj?.direction ?? null,
        text: cluePlainText(clueObj?.text) ?? null,
        error: e?.message ?? String(e),
      });
    }
  }

  if (debug) {
    console.log(
      'DEBUG rows to stage:',
      rows.map((r) => ({
        number: r.number,
        direction: r.direction,
        clue_text: r.clue_text,
      })),
    );
  }

  // Atomic: fail if any clue fails to build
  if (failures.length > 0 || rows.length !== expected.length) {
    await logIngestFailure({
      sourceSlug,
      puzzleDate,
      stage: 'build_rows',
      error: `Row build mismatch: built ${rows.length} / expected ${expected.length}`,
      details: { failures },
    });

    throw new Error(
      `NYT Mini ingest aborted: built ${rows.length}/${expected.length} rows.`,
    );
  }

  if (dryRun) {
    return {
      url,
      puzzleDate,
      expected: expected.length,
      built: rows.length,
      dryRun: true,
    };
  }

  // 🔥 CRITICAL: clear existing staging rows for this puzzle
  // This makes ingestion idempotent and prevents duplicate promotion failures
  await supabase
    .from('staging_occurrence_seed')
    .delete()
    .eq('source_slug', sourceSlug)
    .eq('puzzle_date', puzzleDate);

  // Insert into staging (NOTE: your staging table does NOT have answer_display)
  const { error: insertErr } = await supabase
    .from('staging_occurrence_seed')
    .insert(
      rows.map((r) => ({
        source_slug: r.source_slug,
        puzzle_date: r.puzzle_date,
        number: r.number,
        direction: r.direction,
        clue_text: r.clue_text,
        answer: r.answer,
        enumeration: r.enumeration,
        enumeration_source: r.enumeration_source,
        source_url: r.source_url,
        slug_readable: r.slug_readable,
        slug_md5: r.slug_md5,
        inserted_at: new Date().toISOString(),
      })),
    );

  if (insertErr) {
    await logIngestFailure({
      sourceSlug,
      puzzleDate,
      stage: 'insert_staging',
      error: insertErr.message,
    });
    throw new Error(`Supabase insert staging failed: ${insertErr.message}`);
  }

  // Promote
  const { error: rpcErr } = await supabase.rpc(
    'process_staging_occurrence_seed',
  );
  if (rpcErr) {
    await logIngestFailure({
      sourceSlug,
      puzzleDate,
      stage: 'rpc_promote',
      error: rpcErr.message,
    });
    throw new Error(`RPC failed: ${rpcErr.message}`);
  }

  // Cleanup staging unless debugging
  if (!keepStaging) {
    await supabase
      .from('staging_occurrence_seed')
      .delete()
      .eq('source_slug', sourceSlug)
      .eq('puzzle_date', puzzleDate);
  }

  return {
    url,
    puzzleDate,
    inserted: rows.length,
    nytPuzzleId: payload.id,
    expected: expected.length,
    keepStaging,
  };
}
