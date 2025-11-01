// app/answers/[source]/today/page.tsx
import { redirect } from "next/navigation";

export const revalidate = 3600; // cache for 1 hour

type PageParams = { params: Promise<{ source: string }> };

export default async function TodayPage({ params }: PageParams) {
  const { source } = await params; // await params
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  redirect(`/answers/${encodeURIComponent(source)}/${today}`);
}
