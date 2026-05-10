import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── SchoolHub design tokens (Lavender theme) ──────────────────────
      colors: {
        bg: '#F0EEFF',       // page background (soft lavender)
        surface: '#FFFFFF',
        ink: '#1A1A2E',      // deep navy text
        muted: '#7A7A9A',    // muted blue-gray
        line: '#E2DCFF',     // light purple borders
        primary: {
          DEFAULT: '#7C5CFC',  // violet
          soft: '#EDE9FF',     // pale violet tint
          dark: '#5A3DCC',     // deep violet (3D button border)
        },
        accent: '#4F8EF7',     // blue secondary actions
        // Gamification / status traffic light
        'game-green':        '#22C55E',
        'game-green-tint':   '#DCFCE7',
        'game-yellow':       '#F59E0B',
        'game-yellow-tint':  '#FEF3C7',
        'game-orange':       '#EF4444',
        'game-orange-tint':  '#FEE2E2',
        // Wellbeing aliases
        'wb-green':          '#22C55E',
        'wb-amber':          '#F59E0B',
        'wb-red':            '#EF4444',
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 4px 16px rgba(124,92,252,0.10)',
      },
      fontFamily: {
        sans: ['Nunito', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.1', fontWeight: '800' }],
        'big-num': ['56px', { lineHeight: '1', fontWeight: '800', letterSpacing: '-0.02em' }],
      },
      // Responsive breakpoints: mobile-first
      screens: {
        md: '768px',         // sidebar breakpoint
        tablet: '641px',
        desktop: '1025px',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '450ms',
      },
    },
  },
  plugins: [],
};

export default config;
