import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── SchoolHub design tokens (from SchoolHub_MVP_Mockup.html) ─────────
      colors: {
        bg: '#EAF3FA',       // page background (mint-blue)
        surface: '#FFFFFF',
        ink: '#111827',
        muted: '#6B7280',
        line: '#E5E7EB',     // borders / dividers
        primary: {
          DEFAULT: '#2563EB',
          soft: '#DBEAFE',
        },
        // Gamification / status traffic light
        'game-green':        '#7DC242',
        'game-green-tint':   '#EEF8DF',
        'game-yellow':       '#F5C842',
        'game-yellow-tint':  '#FCF4D9',
        'game-orange':       '#F58A42',
        'game-orange-tint':  '#FCE5DA',
        // Wellbeing aliases (map to same hex for semantic clarity)
        'wb-green':          '#7DC242',
        'wb-amber':          '#F5C842',
        'wb-red':            '#F58A42',
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.1', fontWeight: '800' }],
        'big-num': ['56px', { lineHeight: '1', fontWeight: '800', letterSpacing: '-0.02em' }],
      },
      // Responsive breakpoints: mobile-first
      screens: {
        // defaults: sm=640, md=768, lg=1024, xl=1280
        // Override to match design spec
        tablet: '641px',
        desktop: '1025px',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      transitionDuration: {
        // Profile-switch budget: 300ms
        fast: '150ms',
        normal: '300ms',
        slow: '450ms',
      },
    },
  },
  plugins: [],
};

export default config;
