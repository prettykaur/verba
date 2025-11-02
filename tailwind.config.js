/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'verba-cream': '#F9FAFB', // Primary background
        'verba-slate': '#1F2937', // Primary text (charcoal)
        'verba-blue': '#3B82F6', // Accent blue
        'verba-amber': '#F59E0B', // Secondary accent
        'verba-gray': '#9CA3AF', // Neutral
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        md: '10px',
        lg: '12px',
      },
      boxShadow: {
        card: '0 6px 24px rgba(2, 6, 23, 0.06)',
        tile: '0 1px 0 rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(.2,.8,.2,1)', // microinteraction feel
      },
      fontFamily: {
        // Uses next/font variables defined in layout.tsx
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: [
          'var(--font-plex)',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'var(--font-plexmono)',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
