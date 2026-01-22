// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://tryverba.com';

// How many days of daily pages to expose per source
const DAYS_BACK = 45;

// Sources we want in the sitemap for MVP-3
const SITEMAP_SOURCES = ['nyt-mini'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/answers`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  /* -------------------------------------------------- */
  /* Dynamic daily answer pages                         */
  /* -------------------------------------------------- */

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DAYS_BACK);
  const cutoffISO = cutoff.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('v_search_results_pretty')
    .select('source_slug, puzzle_date')
    .in('source_slug', SITEMAP_SOURCES)
    .gte('puzzle_date', cutoffISO);

  if (error) {
    console.error('[sitemap] supabase error:', error);
    return staticPages;
  }

  const seen = new Set<string>();

  const dailyPages: MetadataRoute.Sitemap = (data ?? [])
    .filter((row) => row.source_slug && row.puzzle_date)
    .map((row) => {
      const key = `${row.source_slug}/${row.puzzle_date}`;
      if (seen.has(key)) return null;
      seen.add(key);

      return {
        url: `${BASE_URL}/answers/${row.source_slug}/${row.puzzle_date}`,
        lastModified: row.puzzle_date,
        changeFrequency: 'daily',
        priority: 0.7,
      };
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  return [...staticPages, ...dailyPages];
}
