// lib/getTopSearches.ts
import { supabaseServer } from '@/lib/supabaseServer';

export async function getTopSearches(limit = 5) {
  const { data, error } = await supabaseServer
    .from('search_event')
    .select('q, created_at')
    .gte(
      'created_at',
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    );

  if (error) {
    console.error('Supabase @top searches:', error);
    return [];
  }

  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    const q = row.q?.trim().toLowerCase();
    if (!q || q.length < 2) continue;
    counts.set(q, (counts.get(q) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([query, searches]) => ({ query, searches }))
    .sort((a, b) => b.searches - a.searches)
    .slice(0, limit);
}
