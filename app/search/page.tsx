// app/search/page.tsx
// To test Supabase data flow E2E
import { supabase } from "@/lib/supabase";

type Row = {
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
      .from("v_search_results")
      .select("*")
      .ilike("clue_text", `%${q}%`)
      .limit(25);

    if (error) {
      console.error("Supabase error: ", error);
    } else {
      rows = (data ?? []) as Row[];
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search a clue…"
          className="flex-1 rounded-xl border px-4 py-3"
        />
        <button className="rounded-xl bg-verba-blue px-5 py-3 text-white">
          Search
        </button>
      </form>

      <ul className="mt-8 divide-y rounded-xl border">
        {rows.map((r) => (
          <li
            key={`${r.clue_id}-${r.answer}`}
            className="p-4 flex items-center justify-between"
          >
            <div>
              <div className="text-slate-800">{r.clue_text}</div>
              <div className="text-xs text-slate-500">
                {r.source_name} · {r.puzzle_date ?? "—"}
              </div>
            </div>
            <div className="text-lg font-semibold tracking-wide">
              {r.answer}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
