import * as React from 'react';

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-brand-slate-200 bg-brand-slate-50 text-brand-slate-700 inline-flex items-center rounded-md border px-2 py-0.5 text-xs">
      {children}
    </span>
  );
}
