// app/sitemap/clues/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://tryverba.com';
const MAX_ROWS = 25000;

type Row = {
  clue_slug_readable: string | null;
  puzzle_date: string | null;
};

export async function GET() {
  const { data, error } = await supabase
    .from('v_search_results_pretty')
    .select('clue_slug_readable, puzzle_date')
    .not('clue_slug_readable', 'is', null)
    .order('puzzle_date', { ascending: false })
    .limit(MAX_ROWS);

  if (error || !data) {
    console.error('[sitemap/clues] supabase error:', error);
    return new NextResponse('', { status: 500 });
  }

  const map = new Map<string, string | null>();

  for (const row of data as Row[]) {
    if (!row.clue_slug_readable) continue;

    if (!map.has(row.clue_slug_readable)) {
      map.set(
        row.clue_slug_readable,
        row.puzzle_date ? String(row.puzzle_date).slice(0, 10) : null,
      );
    }
  }

  const urls = Array.from(map.entries())
    .map(
      ([slug, lastmod]) => `
  <url>
    <loc>${BASE_URL}/clue/${encodeURIComponent(slug)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
    )
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
