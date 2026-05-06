// // app/sitemap/patterns.xml/route.ts
import { NextResponse } from 'next/server';

const BASE_URL = 'https://tryverba.com';

const patterns = [
  '_A_ER',
  '__ING',
  '___ER',
  'A____',
  '__ED',
  '_O__',
  '__AR',
  '__RE',
  '__AL',
  '__OR',
  '__LY',
  '___ED',
  '____ER',
  '____LY',
  'A___',
  '_E__',
  '__E_',
  '_I__',
  '__ST',
  '__EN',
];

export async function GET() {
  const urls = patterns
    .map((p) => {
      const loc = `${BASE_URL}/pattern/${encodeURIComponent(p)}`;
      return `
        <url>
          <loc>${loc}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.6</priority>
        </url>`;
    })
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
