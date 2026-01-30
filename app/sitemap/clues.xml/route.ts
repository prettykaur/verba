// app/sitemap/clues/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://tryverba.com';
const MAX_URLS = 25000;

type ClueRow = {
  slug_readable: string | null;
};

export async function GET() {
  const { data, error } = await supabase
    .from('clue')
    .select('slug_readable')
    .not('slug_readable', 'is', null)
    .order('id', { ascending: false })
    .limit(MAX_URLS);

  if (error || !data) {
    console.error('[sitemap/clues] supabase error:', error);
    return new NextResponse('', { status: 500 });
  }

  const rows = data as unknown as ClueRow[];

  const urls = rows
    .map(
      (row) => `
  <url>
    <loc>${BASE_URL}/clue/${row.slug_readable}</loc>
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
