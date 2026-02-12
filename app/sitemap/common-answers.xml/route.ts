// app/sitemap/common-answers.xml/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://tryverba.com';
const INDEX_THRESHOLD = 3;

export async function GET() {
  // Fetch all indexable answers
  const { data, error } = await supabase
    .from('v_answer_stats')
    .select('answer_key, answer_len, occurrence_count, last_seen')
    .gte('occurrence_count', INDEX_THRESHOLD)
    .order('occurrence_count', { ascending: false })
    .limit(50000); // safety cap

  if (error || !data) {
    console.error('[sitemap/common-answers]', error);
    return new NextResponse('', { status: 500 });
  }

  const answerUrls = data.map((row) => {
    const slug = row.answer_key.toLowerCase();
    const lastmod = row.last_seen
      ? String(row.last_seen).slice(0, 10)
      : undefined;

    return `
  <url>
    <loc>${BASE_URL}/answers/common/${encodeURIComponent(slug)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  // Static category pages
  const staticUrls = `
  <url>
    <loc>${BASE_URL}/answers/common</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${BASE_URL}/answers/common/length/3-letter</loc>
  </url>
  <url>
    <loc>${BASE_URL}/answers/common/length/4-letter</loc>
  </url>
  <url>
    <loc>${BASE_URL}/answers/common/length/5-letter</loc>
  </url>
  <url>
    <loc>${BASE_URL}/answers/common/length/6-letter</loc>
  </url>
  <url>
    <loc>${BASE_URL}/answers/common/length/7-letter</loc>
  </url>
  <url>
    <loc>${BASE_URL}/answers/common/length/8-plus</loc>
  </url>
`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${answerUrls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
