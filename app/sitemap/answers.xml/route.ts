// app/sitemap/answers/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://tryverba.com';
const SOURCE_SLUG = 'nyt-mini';
const DAYS_BACK = 45;

export async function GET() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DAYS_BACK);
  const cutoffISO = cutoff.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('puzzle_day')
    .select('puzzle_date, puzzle_source!inner(slug)')
    .eq('puzzle_source.slug', SOURCE_SLUG)
    .gte('puzzle_date', cutoffISO)
    .order('puzzle_date', { ascending: false });

  if (error || !data) {
    return new NextResponse('', { status: 500 });
  }

  const urls = data
    .map(
      (row) => `
  <url>
    <loc>${BASE_URL}/answers/${SOURCE_SLUG}/${row.puzzle_date}</loc>
    <lastmod>${row.puzzle_date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
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
