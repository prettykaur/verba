// scripts/ingest/debugAmuseJs.ts

import fs from 'node:fs';

async function main() {
  const html = fs.readFileSync('tmp/latimes.html', 'utf8');

  const paramsMatch = html.match(
    /<script[^>]+id=["']params["'][^>]*>\s*([\s\S]*?)\s*<\/script>/,
  );

  if (!paramsMatch) {
    throw new Error('Could not find params script');
  }

  const params = JSON.parse(paramsMatch[1]);

  const resourceVersionDir = params.resourceVersionDir;

  console.log('resourceVersionDir:', resourceVersionDir);

  const jsUrl = `https://lat.amuselabs.com/lat/${resourceVersionDir}/js/c-min.js`;

  console.log('Fetching:', jsUrl);

  const res = await fetch(jsUrl);

  if (!res.ok) {
    throw new Error(`Failed to fetch JS: ${res.status}`);
  }

  const js = await res.text();

  fs.writeFileSync('tmp/latimes-c-min.js', js);

  console.log('Saved JS to tmp/latimes-c-min.js');
  console.log('Length:', js.length);

  for (const term of [
    'rawc',
    'amuseKey',
    'JSON.parse',
    'TextDecoder',
    'Uint8Array',
    'atob',
    'btoa',
    'decode',
  ]) {
    console.log(`${term}:`, js.includes(term));
  }
}

main().catch(console.error);
