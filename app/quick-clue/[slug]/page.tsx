// app/quick-clue/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { decodeQuickClueSlug } from '@/lib/quickClueSlug';
import { formatPuzzleDateLong } from '@/lib/formatDate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

/* -----------------------------
   Helpers
----------------------------- */

function phraseToTokens(phrase: string) {
  return phrase
    .toLowerCase()
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 2 &&
        !['of', 'for', 'the', 'and', 'with', 'from'].includes(w),
    );
}

function titleCase(str: string) {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

export default async function QuickCluePage({ params }: PageProps) {
  const { slug } = await params;

  /* -----------------------------
     1️⃣ Decode slug
  ----------------------------- */

  const { phrase, answerLen } = decodeQuickClueSlug(slug);

  if (!phrase || phrase.length < 2) {
    notFound();
  }

  /* -----------------------------
     2️⃣ (Soft) page lookup
     — DO NOT gate rendering
  ----------------------------- */

  await supabase
    .from('quick_clue_page')
    .select('slug')
    .eq('slug', slug)
    .eq('is_live', true)
    .maybeSingle(); // informational only for now

  /* -----------------------------
     3️⃣ Fetch matching clues
  ----------------------------- */

  const tokens = phraseToTokens(phrase);

  let query = supabase
    .from('v_search_results_pretty')
    .select(
      `
      answer_pretty,
      answer_len,
      puzzle_date,
      clue_text
    `,
    )
    .order('puzzle_date', { ascending: false })
    .limit(400);

  for (const token of tokens) {
    query = query.ilike('clue_text', `%${token}%`);
  }

  const { data: matches, error } = await query;

  if (error || !matches) {
    console.error('[quick-clue] match error:', error);
    notFound();
  }

  /* -----------------------------
     4️⃣ Aggregate answers
  ----------------------------- */

  type AnswerAgg = {
    answer: string;
    count: number;
    lastSeen: string;
    examples: string[];
  };

  const map = new Map<string, AnswerAgg>();

  for (const row of matches) {
    const ans = row.answer_pretty?.trim();
    if (!ans) continue;

    if (answerLen && row.answer_len !== answerLen) continue;
    if (!/^[A-Z ]+$/i.test(ans)) continue;

    const existing = map.get(ans);

    if (!existing) {
      map.set(ans, {
        answer: ans,
        count: 1,
        lastSeen: row.puzzle_date,
        examples: [row.clue_text],
      });
    } else {
      existing.count += 1;
      if (row.puzzle_date > existing.lastSeen) {
        existing.lastSeen = row.puzzle_date;
      }
      if (existing.examples.length < 3) {
        existing.examples.push(row.clue_text);
      }
    }
  }

  /* -----------------------------
   5️⃣ Thresholds (relaxed)
----------------------------- */

  let answers = Array.from(map.values());

  // Allow single-answer pages for long-tail clues
  answers = answers.filter((a) => a.count >= 1);

  // sort: frequency → recency
  answers.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.lastSeen.localeCompare(a.lastSeen);
  });

  answers = answers.slice(0, 20);

  if (answers.length === 0) {
    notFound();
  }

  /* -----------------------------
     6️⃣ Render
  ----------------------------- */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {answerLen
          ? `${answerLen}-Letter Word for ${titleCase(phrase)} (Crossword Answers)`
          : `${titleCase(phrase)} – Crossword Answers`}
      </h1>

      <p className="text-slate-600">
        Below are possible crossword answers for the clue{' '}
        <strong>{phrase}</strong>
        {answerLen
          ? `, all with ${answerLen} letters.`
          : ', based on historical puzzle data.'}
      </p>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-sm font-semibold">Possible answers</h2>

        <ul className="mt-3 space-y-3">
          {answers.map((a) => (
            <li
              key={a.answer}
              className="rounded-lg border bg-slate-50 p-3 text-sm"
            >
              <div className="flex justify-between">
                <strong>{a.answer}</strong>
                <span className="text-xs text-slate-500">Seen {a.count}×</span>
              </div>

              <div className="mt-1 text-xs text-slate-500">
                Last seen: {formatPuzzleDateLong(a.lastSeen)}
              </div>

              <ul className="mt-2 list-disc pl-4 text-xs text-slate-600">
                {a.examples.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
