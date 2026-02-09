// app/sitemap/quick-clues.xml/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encodeQuickClueSlug } from '@/lib/quickClueSlug';

export const runtime = 'edge';

/**
 * Quick-clue sitemap
 * Only includes pages that:
 * - are live
 * - have been seen at least once
 * - have internal links (inferred via occurrence count)
 */
export async function GET() {
  const baseUrl = 'https://tryverba.com';

  /**
   * We derive quick-clue pages from real clue occurrences.
   * This guarantees:
   * - page resolves
   * - page has internal links
   * - no orphan URLs
   */
  const { data, error } = await supabase
    .from('v_search_results_pretty')
    .select(
      `
      clue_text,
      answer_pretty,
      answer_len,
      puzzle_date
    `,
    )
    .not('answer_len', 'is', null)
    .limit(5000); // safety cap

  if (error || !data) {
    return new NextResponse('<!-- sitemap unavailable -->', {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  /**
   * Deduplicate by (clue_text + answer_len)
   * Track latest last_seen per slug
   */
  const map = new Map<string, { lastSeen: string }>();

  for (const row of data) {
    const phrase = row.clue_text?.trim();
    const len = row.answer_len;

    if (!phrase || !len || len <= 0) continue;

    const slug = encodeQuickClueSlug(phrase, len);
    if (!slug) continue;

    const lastSeen = String(row.puzzle_date).slice(0, 10);

    const existing = map.get(slug);
    if (!existing || lastSeen > existing.lastSeen) {
      map.set(slug, { lastSeen });
    }
  }

  const urls = Array.from(map.entries()).map(([slug, meta]) => {
    return `
  <url>
    <loc>${baseUrl}/quick-clue/${encodeURIComponent(slug)}</loc>
    <lastmod>${meta.lastSeen}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
