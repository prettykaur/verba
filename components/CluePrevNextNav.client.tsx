// components/CluePrevNextNav.client.tsx

'use client';

import Link from 'next/link';

type NavItem = {
  occurrence_id: number;
  clue_text: string;
};

export function CluePrevNextNav({
  prev,
  next,
}: {
  prev: NavItem | null;
  next: NavItem | null;
}) {
  return (
    <nav className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Previous */}
      {prev ? (
        <Link
          href={`/clue/${prev.occurrence_id}`}
          className="card-lift card-hover-marigold group rounded-lg border p-4 transition"
        >
          <div className="text-xs text-slate-500">← Previous clue</div>
          <div className="mt-1 font-medium text-slate-900 group-hover:text-slate-700">
            {prev.clue_text}
          </div>
        </Link>
      ) : (
        <div className="rounded-lg border p-4 opacity-40">
          <div className="text-xs text-slate-500">← Previous clue</div>
          <div className="mt-1 text-slate-400">None</div>
        </div>
      )}

      {/* Next */}
      {next ? (
        <Link
          href={`/clue/${next.occurrence_id}`}
          className="card-lift card-hover-marigold group rounded-lg border p-4 text-right transition"
        >
          <div className="text-xs text-slate-500">Next clue →</div>
          <div className="mt-1 font-medium text-slate-900 group-hover:text-slate-700">
            {next.clue_text}
          </div>
        </Link>
      ) : (
        <div className="rounded-lg border p-4 text-right opacity-40">
          <div className="text-xs text-slate-500">Next clue →</div>
          <div className="mt-1 text-slate-400">None</div>
        </div>
      )}
    </nav>
  );
}
