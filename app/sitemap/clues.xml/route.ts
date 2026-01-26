// app/sitemap/clues/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://tryverba.com';
const SOURCE_SLUG = 'nyt-mini';
const DAYS_BACK = 45;
const MAX_URLS = 25000;

type ClueSitemapRow = {
  id: number | string;
  puzzle_day: {
    puzzle_date: string;
  };
};

export async function GET() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DAYS_BACK);
  const cutoffISO = cutoff.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('clue_occurrence')
    .select(
      `
      id,
      puzzle_day:puzzle_day!inner (
        puzzle_date,
        puzzle_source!inner ( slug )
      )
      `,
    )
    .eq('puzzle_day.puzzle_source.slug', SOURCE_SLUG)
    .gte('puzzle_day.puzzle_date', cutoffISO)
    .limit(MAX_URLS);

  if (error || !data) {
    console.error('[sitemap/clues] supabase error:', error);
    return new NextResponse('', { status: 500 });
  }

  const rows = (data as unknown as ClueSitemapRow[]).sort(
    (a, b) =>
      new Date(b.puzzle_day.puzzle_date).getTime() -
      new Date(a.puzzle_day.puzzle_date).getTime(),
  );

  const urls = rows
    .map(
      (row) => `
  <url>
    <loc>${BASE_URL}/clue/${row.id}</loc>
    <lastmod>${row.puzzle_day.puzzle_date}</lastmod>
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
      'Cache-Control': 'no-store',
    },
  });
}
