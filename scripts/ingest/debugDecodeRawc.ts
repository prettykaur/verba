// scripts/ingest/debugDecodeRawc.ts
import fs from 'node:fs';

const htmlPath = process.argv[2];

if (!htmlPath) {
  console.error(
    'Usage: pnpm tsx scripts/ingest/debugDecodeRawc.ts tmp/latimes.html',
  );
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');

const match = html.match(
  /<script[^>]+id=["']params["'][^>]*>\s*([\s\S]*?)\s*<\/script>/,
);

if (!match) {
  throw new Error('Could not find <script id="params">');
}

const params = JSON.parse(match[1]);

if (!params.rawc) {
  throw new Error('No rawc field found');
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

const puzzle = decodeRawc(params.rawc);

console.log({
  id: puzzle.id,
  title: puzzle.title,
  author: puzzle.author,
  width: puzzle.w,
  height: puzzle.h,
  placedWords: puzzle.placedWords?.length,
  boxRows: puzzle.box?.length,
});

fs.writeFileSync('tmp/latimes-decoded.json', JSON.stringify(puzzle, null, 2));

console.log('✅ Wrote decoded puzzle to tmp/latimes-decoded.json');
