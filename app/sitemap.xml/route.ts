// app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';

const BASE_URL = 'https://tryverba.com';

export async function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap/answers.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap/clues.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap/sources.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-store',
    },
  });
}
