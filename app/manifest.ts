// app/manifest.ts

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Verba',
    short_name: 'Verba',
    description: 'Crossword answers & clues.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9FAFB',
    theme_color: '#F9FAFB',
    icons: [
      { src: '/branding/pwa-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/branding/pwa-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
