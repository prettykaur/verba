import dotenv from 'dotenv';
import path from 'path';
import { chromium } from 'playwright';
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

function unscrambleRawc(rawc: string) {
  const chars = rawc.split('');

  function reverse(start: number, len: number) {
    const end = Math.min(start + len, chars.length);

    for (let l = start, r = end - 1; l < r; l++, r--) {
      [chars[l], chars[r]] = [chars[r], chars[l]];
    }
  }

  for (let n = 7; n < rawc.length; n += 26) {
    let s = n;

    let c = 10 + s < rawc.length ? 11 : rawc.length - s + 1;
    reverse(s, c);
    s += c;

    c = 9 + s < rawc.length ? 10 : rawc.length - s + 1;
    reverse(s, c);
    s += c;

    c = 9 + s < rawc.length ? 10 : rawc.length - s + 1;
    reverse(s, c);
    s += c;

    c = 13 + s < rawc.length ? 14 : rawc.length - s + 1;
    reverse(s, c);

    n = s + c;
  }

  for (let n = 0; n < rawc.length; n += 64) {
    const c = 6 + n < rawc.length ? 7 : rawc.length - n + 1;
    reverse(n, c);
    n += c;
  }

  for (let n = 52; n < rawc.length; n += 52) {
    let s = n;

    let c = 8 + s < rawc.length ? 9 : rawc.length - s + 1;
    reverse(s, c);
    s += c;

    c = 9 + s < rawc.length ? 10 : rawc.length - s + 1;
    reverse(s, c);

    n = s + c;
  }

  return chars.join('');
}

function decodeRawc(rawc: string) {
  const unscrambled = unscrambleRawc(rawc);
  const decoded = Buffer.from(unscrambled, 'base64').toString('utf8');
  return JSON.parse(decoded);
}

function parseParamsScript(html: string) {
  const match = html.match(
    /<script[^>]+id=["']params["'][^>]*>\s*([\s\S]*?)\s*<\/script>/,
  );

  if (!match) return null;

  return JSON.parse(match[1]);
}

async function fetchPuzzleWithPlaywright(puzzleId: string, debug = false) {
  const browser = await chromium.launch({
    headless: false,
  });

  try {
    const context = await browser.newContext({
      viewport: {
        width: 1440,
        height: 1200,
      },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    let capturedParams: any = null;

    page.on('response', async (response) => {
      try {
        const url = response.url();

        if (url.includes('/crossword') && url.includes(`id=${puzzleId}`)) {
          const text = await response.text().catch(() => '');

          const match = text.match(
            /<script[^>]+id=["']params["'][^>]*>\s*([\s\S]*?)\s*<\/script>/,
          );

          if (match) {
            const params = JSON.parse(match[1]);

            if (params?.rawc) {
              capturedParams = params;

              if (debug) {
                console.log('DEBUG captured rawc response');
                console.log('DEBUG response URL:', url);
              }
            }
          }
        }
      } catch {
        // ignore
      }
    });

    const uid = crypto.randomBytes(32).toString('hex');

    const crosswordUrl =
      `https://lat.amuselabs.com/lat/crossword` +
      `?id=${puzzleId}` +
      `&set=latimes` +
      `&embed=1` +
      `&style=1` +
      `&picker=date-picker` +
      `&uid=${uid}` +
      `&src=https%3A%2F%2Fwww.latimes.com%2Fgames%2Fdaily-crossword`;

    if (debug) {
      console.log('DEBUG opening crossword:', crosswordUrl);
    }

    await page.goto(crosswordUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await page.waitForTimeout(12000);

    if (!capturedParams?.rawc) {
      const html = await page.content();

      console.log('DEBUG FINAL HTML:');
      console.log(html.slice(0, 5000));

      throw new Error(`Could not capture rawc for ${puzzleId}`);
    }

    return capturedParams;
  } finally {
    await browser.close();
  }
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
