// scripts/ingest/runNytMini.ts
import { ingestNytMini } from './nytMini';

function getFlag(name: string) {
  return process.argv.includes(name);
}

async function main() {
  const date = process.argv[2]; // optional YYYY-MM-DD
  const dryRun = getFlag('--dry-run');
  const keepStaging = getFlag('--keep-staging');
  const debug = getFlag('--debug');

  const result = await ingestNytMini(date, { dryRun, keepStaging, debug });
  console.log('✅ NYT Mini ingest complete:', result);
}

main().catch((err) => {
  console.error('❌ Ingest failed:', err);
  process.exit(1);
});
