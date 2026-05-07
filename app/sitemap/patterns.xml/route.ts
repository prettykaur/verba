// // app/sitemap/patterns.xml/route.ts
import { NextResponse } from 'next/server';

const BASE_URL = 'https://tryverba.com';

const patterns = [
  'A____',
  'B____',
  'C____',
  'D____',
  'E____',
  'F____',
  'G____',
  'H____',
  'I____',
  'L____',
  'M____',
  'N____',
  'O____',
  'P____',
  'R____',
  'S____',
  'T____',
  'AR___',
  'RE___',
  'IN___',
  'CO___',
  'DE___',
  'UN___',
  'PR___',
  'ST___',
  'TR___',
  'PL___',
  'CH___',
  'CL___',
  'CR___',
];

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  const urls = patterns
    .map((p) => {
      const loc = `${BASE_URL}/pattern/${encodeURIComponent(p)}`;
      return `
        <url>
          <loc>${loc}</loc>
          <lastmod>${today}</lastmod>
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
