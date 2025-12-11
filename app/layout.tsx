// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { inter, plexMono } from './fonts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Verba — Crossword Answers & Clues',
  description:
    'Get quick, clean crossword answers and clues. Search by clue or pattern, and browse daily crossword solutions from major sources.',
  alternates: { canonical: 'https://tryverba.com' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="bg-verba-cream text-verba-slate antialiased">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
