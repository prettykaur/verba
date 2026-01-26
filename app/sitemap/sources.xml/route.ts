// app/sitemap/sources/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://tryverba.com';
const SOURCE_SLUG = 'nyt-mini';

export async function GET() {
  const { data, error } = await supabase
    .from('puzzle_day')
    .select('puzzle_date')
    .order('puzzle_date', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return new NextResponse('', { status: 500 });
  }

  const lastmod = data[0].puzzle_date;

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/answers/${SOURCE_SLUG}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-store',
    },
  });
}
