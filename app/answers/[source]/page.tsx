// app/answers/[source]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600; // refresh hourly

// simple local map to avoid DB reads inside generateMetadata
const SOURCE_NAMES: Record<string, string> = {
  "nyt-mini": "NYT Mini",
};

type PageProps = { params: Promise<{ source: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const awaited = await params;
  const source = awaited.source;
  const sourceName = SOURCE_NAMES[source] ?? source;
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
  const awaited = await params;
  const source = awaited.source;

  const { data, error } = await supabase
    .from("v_search_results_pretty")
    .select("puzzle_date, source_name")
    .eq("source_slug", source)
    .order("puzzle_date", { ascending: false })
    .limit(500);

  if (error) console.error(error);

  const sourceName =
    (data?.[0] as { source_name: string | null } | undefined)?.source_name ??
    SOURCE_NAMES[source] ?? source;

  const dates: string[] = [];
  for (const r of (data ?? []) as { puzzle_date: string | null }[]) {
    if (!r.puzzle_date) continue;
    if (!dates.includes(r.puzzle_date)) dates.push(r.puzzle_date);
    if (dates.length >= 60) break;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">{sourceName} — Recent Answers</h1>
      <p className="mt-2 text-slate-600">Choose a date to view all clues & solutions.</p>

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
