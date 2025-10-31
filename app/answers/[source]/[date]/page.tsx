// app/answers/[source]/[date]/page.tsx
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
  occurrence_id: number;
  clue_text: string;
  answer: string | null;
  answer_pretty: string | null;
  number: number | null;
  direction: "across" | "down" | null;
  source_slug: string;
  source_name: string | null;
  puzzle_date: string; // 'YYYY-MM-DD'
};

export default async function DailyAnswersPage({
  params,
}: {
  params: Promise<{ source: string; date: string }>;
}) {
  const awaited = await params;
  const source = decodeURIComponent(awaited.source).trim().toLowerCase();
  const date = decodeURIComponent(awaited.date).trim().slice(0, 10);

  const { data, error } = await supabase
    .from("v_search_results_pretty")
    .select(
      `
      occurrence_id,
      clue_text,
      answer,
      answer_pretty,
      number,
      direction,
      source_slug,
      source_name,
      puzzle_date
      `
    )
    .eq("source_slug", source)
    .eq("puzzle_date", date)
    .order("number", { ascending: true });

  if (error) {
    console.error("Supabase @daily answers:", error);
  }

  const rows = (data ?? []) as Row[];

  const sourceName =
    rows[0]?.source_name ?? (source === "nyt-mini" ? "NYT Mini" : source);
  const dt = date; // keep a stable alias

  // ---- JSON-LD: FAQPage (cap at 50) ----
  const faqs =
    rows.length > 0
      ? rows.slice(0, 50).map((r) => ({
          "@type": "Question",
          name: r.clue_text,
          acceptedAnswer: {
            "@type": "Answer",
            text: (r.answer_pretty ?? r.answer ?? "").trim(),
          },
        }))
      : [];

  const jsonLdFaq = rows.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs,
      }
    : null;

  // ---- JSON-LD: BreadcrumbList ----
  const jsonLdBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://tryverba.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Answers",
        item: "https://tryverba.com/answers",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: sourceName,
        item: `https://tryverba.com/answers/${encodeURIComponent(source)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: dt,
        item: `https://tryverba.com/answers/${encodeURIComponent(
          source
        )}/${encodeURIComponent(dt)}`,
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {/* JSON-LD blocks */}
      <script
        type="application/ld+json"
        // Always safe to output breadcrumbs
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      {jsonLdFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      )}

      <h1 className="text-2xl font-bold">
        {sourceName} — Answers for {dt}
      </h1>
      <p className="mt-2 text-slate-600">
        All clues &amp; solutions for {sourceName}. Use the site search for more
        days and sources.
      </p>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border bg-white p-6">
          <p className="text-slate-700">
            No data for this date yet. Check your URL or try another date/source.
          </p>
          <div className="mt-4 text-sm text-slate-500">
            <div>Debug:</div>
            <ul className="list-disc pl-5">
              <li>
                source_slug = <code>{source}</code>
              </li>
              <li>
                puzzle_date = <code>{dt}</code>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <ul className="mt-8 divide-y rounded-xl border bg-white">
          {rows.map((r) => (
            <li
              key={r.occurrence_id}
              className="flex items-start justify-between gap-4 p-4"
            >
              <div>
                <div className="text-slate-800">{r.clue_text}</div>
                <div className="text-xs text-slate-500">
                  {r.direction ?? "—"} {r.number ?? "—"} · {r.puzzle_date}
                </div>
              </div>
              <div className="text-lg font-semibold tracking-wide">
                {r.answer_pretty ?? r.answer ?? "—"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
