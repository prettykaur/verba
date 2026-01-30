// components/PopularClues.tsx
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardBody } from '@/components/ui/Card';

type PopularCluesProps = {
  title?: string;
  limit?: number;
};

export async function PopularClues({
  title = 'Popular Clues',
  limit = 6,
}: PopularCluesProps) {
  const { data, error } = await supabase
    .from('clue')
    .select('text, slug_readable')
    .not('slug_readable', 'is', null)
    .order('id', { ascending: false })
    .limit(limit);

  if (error || !data || data.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-brand-ink text-lg font-semibold">{title}</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.map((c) => (
          <Link
            key={c.slug_readable}
            href={`/clue/${c.slug_readable}`}
            className="block"
          >
            <Card className="card-hover-marigold card-lift hover:border-brand-ink transition hover:shadow-sm">
              <CardBody className="text-brand-slate-700 font-medium leading-snug">
                <span className="line-clamp-2 text-sm font-medium text-slate-800">
                  {c.text}
                </span>
                <span className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-400">
                  Crossword clue
                </span>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
