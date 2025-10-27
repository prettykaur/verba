// app/search/page.tsx
import { supabase } from "@/lib/supabase";

type Row = {
  occurrence_id: number;
  clue_id: number;
  clue_text: string;
  answer: string;
  answer_len: number;
  word_id: number | null;
  word_text: string | null;
  word_len: number | null;
  puzzle_date: string | null;
  source_slug: string | null;
  source_name: string | null;
  enumeration: string | null;
  answer_display: string | null;
  answer_pretty: string | null; // from v_search_results_pretty
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = " " } = await searchParams; // await
  const query = q.trim();

  let rows: Row[] = [];

  if (query) {
    const { data, error } = await supabase
      .from("v_search_results_pretty")
      .select(
        `
        occurrence_id,
        clue_id,
        clue_text,
        answer,
        answer_len,
        word_id,
        word_text,
        word_len,
        puzzle_date,
        source_slug,
        source_name,
        enumeration,
        answer_display,
        answer_pretty
        `
      )
      .ilike("clue_text", `%${query}%`)
      .limit(25)
      .throwOnError()
      .overrideTypes<Row[], { merge: false }>();

    if (error) {
      console.error("Supabase error: ", error);
    } else {
      rows = data ?? [];
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search a clue…"
          className="flex-1 rounded-xl border px-4 py-3"
        />
        <button className="rounded-xl bg-verba-blue px-5 py-3 text-white">
          Search
        </button>
      </form>

      {!query ? (
        <p className="mt-6 text-slate-600">Try “Sushi seaweed”.</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-slate-600">No matching clues found.</p>
      ) : (
        <ul className="mt-8 divide-y rounded-xl border bg-white">
          {rows.map((r) => (
            <li
              key={`${r.occurrence_id}-${r.answer}`}
              className="p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-slate-800">{r.clue_text}</div>
                <div className="text-xs text-slate-500">
                  {r.source_name} · {r.puzzle_date ?? "—"}
                </div>
              </div>
              <div className="text-lg font-semibold tracking-wide">
                {r.answer_pretty ?? r.answer}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
