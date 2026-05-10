import dotenv from 'dotenv';
import path from 'path';
import fs from 'node:fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { logIngestFailure } from './logFailure';
import crypto from 'node:crypto';

type Dir = 'across' | 'down';

const SOURCE_SLUG = 'la-times';
const SOURCE_NAME = 'LA Times Crossword';

function md5(s: string): string {
  return crypto.createHash('md5').update(s, 'utf8').digest('hex');
}

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

function toISODateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseDateArg(dateArg?: string): string {
  if (!dateArg) return toISODateOnly(new Date());

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateArg)) {
    throw new Error(`Invalid date "${dateArg}". Use YYYY-MM-DD.`);
  }

  return dateArg;
}

function dateToPuzzleId(date: string) {
  const yy = date.slice(2, 4);
  const mm = date.slice(5, 7);
  const dd = date.slice(8, 10);
  return `tca${yy}${mm}${dd}`;
}

function puzzleIdToDate(id: string) {
  const m = id.match(/^tca(\d{2})(\d{2})(\d{2})$/);
  if (!m) return null;
  return `20${m[1]}-${m[2]}-${m[3]}`;
}

function slugifyClue(clueText: string) {
  return clueText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeAnswerToLetters(answerRaw: string): string {
  return answerRaw.replace(/[^A-Za-z]/g, '').toUpperCase();
}

export async function ingestLatimes(
  dateArg?: string,
  opts?: {
    dryRun?: boolean;
    keepStaging?: boolean;
    debug?: boolean;
  },
) {
  const dryRun = !!opts?.dryRun;
  const keepStaging = !!opts?.keepStaging;
  const debug = !!opts?.debug;

  const SUPABASE_URL = mustGetEnv('NEXT_PUBLIC_SUPABASE_URL');
  const SERVICE_ROLE = mustGetEnv('SUPABASE_SERVICE_ROLE_KEY');

  const date = parseDateArg(dateArg);
  const puzzleId = dateToPuzzleId(date);

  try {
    const jsonPath =
      process.argv.find((a) => a.startsWith('--json='))?.split('=')[1] ??
      `tmp/latimes-${date}.json`;

    if (!fs.existsSync(jsonPath)) {
      throw new Error(
        `Missing decoded LA Times JSON file: ${jsonPath}. Save the decoded puzzle JSON there first.`,
      );
    }

    const puzzle = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    const puzzleDate = puzzleIdToDate(String(puzzle.id ?? puzzleId)) ?? date;
    const placedWords = puzzle.placedWords ?? [];

    if (!Array.isArray(placedWords) || placedWords.length === 0) {
      throw new Error('Decoded puzzle has no placedWords');
    }

    const rows = placedWords.map((word: any) => {
      const clueText = String(word?.clue?.clue ?? '').trim();

      const answerDisplay = String(
        word?.originalTerm ?? word?.word ?? '',
      ).trim();

      const answer = normalizeAnswerToLetters(answerDisplay);
      const number = Number(word?.clueNum);
      const direction: Dir = word?.acrossNotDown ? 'across' : 'down';

      if (!clueText) {
        throw new Error('Missing clue text');
      }

      if (!answer) {
        throw new Error(`Missing answer for clue "${clueText}"`);
      }

      if (!Number.isFinite(number)) {
        throw new Error(`Bad clue number for clue "${clueText}"`);
      }

      return {
        source_slug: SOURCE_SLUG,
        puzzle_date: puzzleDate,
        number,
        direction,
        clue_text: clueText,
        answer,
        source_url: 'https://www.latimes.com/games/daily-crossword',
        slug_md5: md5(clueText),
        slug_readable: slugifyClue(clueText),
      };
    });

    if (debug) {
      console.log('DEBUG puzzle:', {
        id: puzzle.id,
        title: puzzle.title,
        author: puzzle.author,
        date: puzzleDate,
        rows: rows.length,
      });

      console.log('DEBUG first rows:', rows.slice(0, 5));
    }

    if (dryRun) {
      return {
        url: 'https://www.latimes.com/games/daily-crossword',
        puzzleDate,
        expected: placedWords.length,
        built: rows.length,
        dryRun: true,
      };
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    await supabase.from('puzzle_source').upsert(
      {
        slug: SOURCE_SLUG,
        name: SOURCE_NAME,
        url: 'https://www.latimes.com/games/daily-crossword',
        puzzle_type_id: 1,
        timezone: 'America/Los_Angeles',
      },
      { onConflict: 'slug' },
    );

    await supabase
      .from('staging_occurrence_seed')
      .delete()
      .eq('source_slug', SOURCE_SLUG)
      .eq('puzzle_date', puzzleDate);

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
          source_url: r.source_url,
          slug_readable: r.slug_readable,
          slug_md5: r.slug_md5,
          inserted_at: new Date().toISOString(),
        })),
      );

    if (insertErr) {
      await logIngestFailure({
        sourceSlug: SOURCE_SLUG,
        puzzleDate,
        stage: 'insert_staging',
        error: insertErr.message,
      });

      throw new Error(`Supabase insert staging failed: ${insertErr.message}`);
    }

    const { error: rpcErr } = await supabase.rpc(
      'process_staging_occurrence_seed',
    );

    if (rpcErr) {
      await logIngestFailure({
        sourceSlug: SOURCE_SLUG,
        puzzleDate,
        stage: 'rpc_promote',
        error: rpcErr.message,
      });

      throw new Error(`RPC failed: ${rpcErr.message}`);
    }

    if (!keepStaging) {
      await supabase
        .from('staging_occurrence_seed')
        .delete()
        .eq('source_slug', SOURCE_SLUG)
        .eq('puzzle_date', puzzleDate);
    }

    return {
      url: 'https://www.latimes.com/games/daily-crossword',
      puzzleDate,
      inserted: rows.length,
      latimesPuzzleId: puzzle.id,
      title: puzzle.title,
      author: puzzle.author,
      expected: placedWords.length,
      keepStaging,
    };
  } catch (e: any) {
    await logIngestFailure({
      sourceSlug: SOURCE_SLUG,
      puzzleDate: date,
      stage: 'latimes_ingest',
      error: e?.message ?? String(e),
    });

    throw e;
  }
}
