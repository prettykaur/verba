// app/answers/[source]/today/loading.tsx

export default function Loading() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
    </div>
  );
}
