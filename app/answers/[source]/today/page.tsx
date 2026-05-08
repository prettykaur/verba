// app/answers/[source]/today/page.tsx
import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600;

type PageParams = {
  params: Promise<{ source: string }>;
};

export default async function TodayPage({ params }: PageParams) {
  const { source } = await params;
  const sourceSlug = decodeURIComponent(source).trim().toLowerCase();

  const { data, error } = await supabase
    .from('puzzle_day')
    .select('puzzle_date, puzzle_source!inner(slug)')
    .eq('puzzle_source.slug', sourceSlug)
    .order('puzzle_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.puzzle_date) {
    console.error('[today redirect] error:', error);
    notFound();
  }

  redirect(
    `/answers/${encodeURIComponent(sourceSlug)}/${String(
      data.puzzle_date,
    ).slice(0, 10)}`,
  );
}
