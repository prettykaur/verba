// app/search/loading.tsx

function RowSkeleton() {
  return (
    <div className="skeleton-card border-brand-slate-200 border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="skeleton-line h-4 w-3/4"></div>
          <div className="skeleton-line h-3 w-1/3"></div>
        </div>
        <div className="skeleton-line h-6 w-24 rounded-md"></div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="space-y-2 text-center">
          <div className="bg-brand-slate-100 mx-auto h-7 w-52 rounded" />
          <div className="bg-brand-slate-100 mx-auto h-5 w-72 rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      </main>
    </>
  );
}
