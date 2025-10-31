// app/answers/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 60 * 60; // refresh hourly

export const metadata: Metadata = {
  title: "Daily Crossword Answers | Verba",
  description:
    "Browse daily crossword answers by source. Quick links to recent days for NYT Mini and more.",
  alternates: { canonical: "https://tryverba.com/answers" },
};

type Row = {
  source_slug: string | null;
  source_name: string | null;
  puzzle_date: string | null;
};

export default async function AnswersHubPage() {
  // Pull a recent slice (group in JS)
  const { data, error } = await supabase
    .from("v_search_results_pretty")
    .select("source_slug, source_name, puzzle_date")
    .order("puzzle_date", { ascending: false })
    .limit(500);

  if (error) {
    console.error(error);
  }

  // Group by source -> unique recent dates (max 12)
  const grouped = new Map<
    string,
    { name: string; dates: string[] }
  >();

  for (const r of (data ?? []) as Row[]) {
    if (!r.source_slug || !r.puzzle_date) continue;
    const key = r.source_slug;
    const name = r.source_name ?? r.source_slug;
    if (!grouped.has(key)) grouped.set(key, { name, dates: [] });
    const bucket = grouped.get(key)!;
    if (!bucket.dates.includes(r.puzzle_date) && bucket.dates.length < 12) {
      bucket.dates.push(r.puzzle_date);
    }
  }

  const sources = Array.from(grouped.entries()); // [slug, {name, dates}]

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Daily Answers</h1>
      <p className="mt-2 text-slate-600">
        Pick a source below, then jump into recent days.
      </p>

      {sources.length === 0 ? (
        <div className="mt-6 rounded-lg border bg-white p-4">
          <p>No sources yet. Check back soon.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {sources.map(([slug, { name, dates }]) => (
            <section key={slug} className="rounded-lg border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  <Link
                    href={`/answers/${slug}`}
                    className="text-verba-blue underline"
                  >
                    {name}
                  </Link>
                </h2>
                <Link
                  href={`/answers/${slug}`}
                  className="text-sm text-verba-blue underline"
                >
                  View all dates
                </Link>
              </div>
              <ul className="flex flex-wrap gap-2">
                {dates.map((d) => (
                  <li key={d}>
                    <Link
                      href={`/answers/${slug}/${d}`}
                      className="inline-block rounded-md border px-3 py-1 text-sm hover:bg-slate-50"
                    >
                      {d}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
