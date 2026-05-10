// scripts/ingest/runLatimes.ts

import { ingestLatimes } from './latimes';

function getFlag(name: string) {
  return process.argv.includes(name);
}

async function main() {
  const date = process.argv[2]; // optional YYYY-MM-DD
  const dryRun = getFlag('--dry-run');
  const keepStaging = getFlag('--keep-staging');
  const debug = getFlag('--debug');

  const result = await ingestLatimes(date, { dryRun, keepStaging, debug });
  console.log('✅ LA Times ingest complete:', result);
}

main().catch((err) => {
  console.error('❌ LA Times ingest failed:', err);
  process.exit(1);
});
