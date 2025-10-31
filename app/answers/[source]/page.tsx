// app/answers/[source]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 60 * 60; // refresh hourly

// If you have a small fixed set, you can optionally pre-generate:
// export function generateStaticParams() {
//   return [{ source: "nyt-mini" }];
// }

type PageProps = { params: { source: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const source = params.source;
  // Try to resolve a friendly name from any row
  const { data } = await supabase
    .from("v_search_results_pretty")
    .select("source_name")
    .eq("source_slug", source)
    .limit(1);

  const sourceName =
    (data?.[0] as { source_name: string | null } | undefined)?.source_name ??
    source;

  const title = `${sourceName} — Recent Answers | Verba`;
  const description = `Recent dates and daily answer pages for ${sourceName}.`;
  const url = `https://tryverba.com/answers/${source}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Verba", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SourceIndexPage({ params }: PageProps) {
  const source = params.source;

  // Fetch most recent ~90 rows then distill unique dates (cap at 60 dates)
  const { data, error } = await supabase
    .from("v_search_results_pretty")
    .select("puzzle_date, source_name")
    .eq("source_slug", source)
    .order("puzzle_date", { ascending: false })
    .limit(500);

  if (error) {
    console.error(error);
  }

  const sourceName =
    (data?.[0] as { source_name: string | null } | undefined)?.source_name ??
    source;

  // Unique dates in descending order
  const dates: string[] = [];
  for (const r of (data ?? []) as { puzzle_date: string | null }[]) {
    if (!r.puzzle_date) continue;
    if (!dates.includes(r.puzzle_date)) dates.push(r.puzzle_date);
    if (dates.length >= 60) break;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">{sourceName} — Recent Answers</h1>
      <p className="mt-2 text-slate-600">
        Choose a date to view all clues & solutions.
      </p>

      {dates.length === 0 ? (
        <div className="mt-6 rounded-lg border bg-white p-4">
          <p>No dates found for this source yet.</p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-3">
          {dates.map((d) => (
            <li key={d}>
              <Link
                href={`/answers/${source}/${d}`}
                className="block rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-50"
              >
                {d}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Link href="/answers" className="text-verba-blue underline">
          ← Back to all sources
        </Link>
      </div>
    </main>
  );
}
