// app/sitemap/archives.xml/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://tryverba.com';

export async function GET() {
  const { data: archiveSources } = await supabase
    .from('puzzle_source')
    .select('slug');

  const [yearsRes, monthsRes] = await Promise.all([
    supabase
      .from('v_archive_years')
      .select('source_slug, year, lastmod')
      .order('lastmod', { ascending: false }),

    supabase
      .from('v_archive_months')
      .select('source_slug, year, month, lastmod')
      .order('lastmod', { ascending: false }),
  ]);

  if (yearsRes.error || monthsRes.error) {
    console.error(
      '[sitemap/archives] error:',
      yearsRes.error ?? monthsRes.error,
    );
    return new NextResponse('', { status: 500 });
  }

  const indexUrls =
    (archiveSources ?? []).map(
      (s) => `
  <url>
    <loc>${BASE_URL}/answers/${s.slug}/archive</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
    ) ?? [];

  const yearUrls =
    (yearsRes.data ?? []).map((r) => {
      const lastmod = String(r.lastmod).slice(0, 10);
      return `
  <url>
    <loc>${BASE_URL}/answers/${r.source_slug}/archive/${r.year}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
    }) ?? [];

  const monthUrls =
    (monthsRes.data ?? []).map((r) => {
      const lastmod = String(r.lastmod).slice(0, 10);
      return `
  <url>
    <loc>${BASE_URL}/answers/${r.source_slug}/archive/${r.year}/${r.month}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
    }) ?? [];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexUrls.join('\n')}
${yearUrls.join('\n')}
${monthUrls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
