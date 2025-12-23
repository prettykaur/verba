// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F9FAFB', // verba-cream bg
          padding: 80,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
          }}
        >
          {/* Use SVG icon */}
          <img
            src={'https://tryverba.com/branding/verba-icon.svg'}
            width={140}
            height={140}
            alt=""
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                fontSize: 78,
                fontWeight: 800,
                letterSpacing: -2,
                color: '#1F2937',
                lineHeight: 1,
              }}
            >
              verba
            </div>
            <div
              style={{
                fontSize: 34,
                color: '#374151',
                lineHeight: 1.2,
                maxWidth: 800,
              }}
            >
              Crossword answers & clues — fast, clean, spoiler-safe.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
