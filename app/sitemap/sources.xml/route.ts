// app/sitemap/sources/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://tryverba.com';

export async function GET() {
  // 1) get all sources
  const { data: sources, error: sourcesErr } = await supabase
    .from('puzzle_source')
    .select('slug')
    .order('slug', { ascending: true });

  if (sourcesErr || !sources || sources.length === 0) {
    console.error('[sitemap/sources] puzzle_source error:', sourcesErr);
    return new NextResponse('', { status: 500 });
  }

  // 2) get lastmod per source (latest puzzle_date we have for that source)
  // Do one query per source
  const rows = await Promise.all(
    sources.map(async (s) => {
      const slug = s.slug;

      const { data, error } = await supabase
        .from('puzzle_day')
        .select('puzzle_date, puzzle_source!inner(slug)')
        .eq('puzzle_source.slug', slug)
        .order('puzzle_date', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        // If a source exists but has no puzzle_day yet, still include it with no lastmod.
        return { slug, lastmod: null as string | null };
      }

      return { slug, lastmod: data[0].puzzle_date as string };
    }),
  );

  const urls = rows
    .map(
      ({ slug, lastmod }) => `
  <url>
    <loc>${BASE_URL}/answers/${slug}</loc>
    ${lastmod ? `<lastmod>${String(lastmod).slice(0, 10)}</lastmod>` : ''}
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
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
