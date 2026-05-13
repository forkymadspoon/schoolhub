import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── SchoolHub design tokens (Ocean Blue theme — matches parent-pilot-buddy reference) ──
      colors: {
        // Page & surface
        bg:      '#EAF4FB',   // light sky-blue page background  hsl(204 65% 95%)
        surface: '#FFFFFF',
        ink:     '#1F2B3D',   // dark navy text                  hsl(215 32% 18%)
        muted:   '#607085',   // blue-gray muted text             hsl(215 16% 45%)
        line:    '#D4E3ED',   // light blue border                hsl(204 40% 88%)

        // Primary — teal-blue  hsl(201 78% 45%)
        primary: {
          DEFAULT: '#198ECC',
          soft:    '#D6EBF5',   // hsl(200 60% 90%)
          dark:    '#146E9F',   // hsl(201 78% 35%) — button border
        },

        // Accent — soft cyan  hsl(188 70% 88%)
        accent: '#CBF0F6',

        // Gamification / status traffic-light
        'game-green':        '#87C83C',   // hsl(88  56% 51%)
        'game-green-tint':   '#EBF7DE',   // hsl(88  60% 92%)
        'game-yellow':       '#F4CC48',   // hsl(46  89% 62%)
        'game-yellow-tint':  '#FDF4D8',   // hsl(46  90% 92%)
        'game-orange':       '#F58142',   // hsl(21  90% 61%)
        'game-orange-tint':  '#FDE5D8',   // hsl(21  90% 92%)

        // Wellbeing aliases (same hues)
        'wb-green': '#87C83C',
        'wb-amber': '#F4CC48',
        'wb-red':   '#F58142',
      },
      borderRadius: {
        card: '20px',      // 1.25rem — matches reference --radius
        pill: '999px',
      },
      boxShadow: {
        card: '0 8px 24px -12px rgba(10,70,100,0.18)',
        soft: '0 2px 8px -2px rgba(10,70,100,0.08)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.1', fontWeight: '800' }],
        'big-num': ['56px', { lineHeight: '1', fontWeight: '800', letterSpacing: '-0.02em' }],
      },
      screens: {
        md:      '768px',
        tablet:  '641px',
        desktop: '1025px',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      transitionDuration: {
        fast:   '150ms',
        normal: '300ms',
        slow:   '450ms',
      },
    },
  },
  plugins: [],
};

export default config;
