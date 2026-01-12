// scripts/ingest/env.ts
import dotenv from 'dotenv';
import path from 'node:path';

export function loadEnv() {
  // Always load project-root .env.local
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

  // Optional: support CI / other files later
  // dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}
