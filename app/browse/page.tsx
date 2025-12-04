// app/browse/page.tsx
import { redirect } from 'next/navigation';

export const revalidate = 3600;

export default function BrowsePage() {
  // For MVP, just treat "Browse" as an alias for /answers.
  redirect('/answers');
}
