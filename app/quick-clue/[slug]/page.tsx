// app/quick-clue/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { decodeQuickClueSlug } from '@/lib/quickClueSlug';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function QuickCluePage({ params }: PageProps) {
  const { slug } = await params;

  // Decode the slug
  const { phrase, answerLen } = decodeQuickClueSlug(slug);

  if (!phrase || phrase.length < 2) {
    notFound();
  }

  // Check if this page exists + is live
  const { data: page, error } = await supabase
    .from('quick_clue_page')
    .select('*')
    .eq('slug', slug)
    .eq('is_live', true)
    .maybeSingle();

  if (error) {
    console.error('[quick-clue] page lookup error:', error);
    notFound();
  }

  if (!page) {
    notFound();
  }

  // Temporary placeholder UI
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {answerLen
          ? `${answerLen}-Letter Word for ${phrase}`
          : `${phrase} — Crossword Answers`}
      </h1>

      <p className="text-slate-600">
        This page helps you find crossword answers that match the clue{' '}
        <strong>{phrase}</strong>
        {answerLen ? ` with ${answerLen} letters.` : '.'}
      </p>

      <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-600">
        Results coming next.
      </div>
    </div>
  );
}
