// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { inter, plexMono } from './fonts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Script from 'next/script';

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  metadataBase: new URL('https://tryverba.com'),
  title: {
    default: 'Verba — Crossword Answers & Clues',
    template: '%s — Verba',
  },
  description:
    'Get quick, clean crossword answers and clues. Search by clue or pattern, and browse daily crossword solutions from major sources.',
  alternates: { canonical: '/' },

  // Favicons / app icons (these should be in /public root OR handled by app icons route)
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      // Optional if you add PNG favicons:
      // { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Verba',
    title: 'Verba — Crossword Answers & Clues',
    description:
      'Get quick, clean crossword answers and clues. Search by clue or pattern, and browse daily crossword solutions from major sources.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Verba — Crossword Answers & Clues',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Verba — Crossword Answers & Clues',
    description:
      'Get quick, clean crossword answers and clues. Search by clue or pattern, and browse daily crossword solutions from major sources.',
    images: ['/twitter-image'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-verba-cream text-verba-slate antialiased">
        <Header />

        <main className="mx-auto max-w-3xl flex-1 px-4 py-8">{children}</main>

        <Footer />

        <Script
          defer
          data-domain="tryverba.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

export const viewport = {
  themeColor: '#F9FAFB',
};
