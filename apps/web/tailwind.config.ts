import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── SchoolHub design tokens (Ocean Blue theme — matches parent-pilot-buddy reference) ──
      colors: {
        // Page & surface
        bg:      '#FFFFFF',   // white page background
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
      keyframes: {
        pop: {
          '0%':   { transform: 'scale(0.8)', opacity: '0' },
          '70%':  { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.45' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%':      { transform: 'rotate(-12deg)' },
          '60%':      { transform: 'rotate(12deg)' },
          '80%':      { transform: 'rotate(-6deg)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-6px)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
      },
      animation: {
        'pop':           'pop 280ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'fade-up':       'fade-up 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-soft':    'pulse-soft 2s ease-in-out infinite',
        'wiggle':        'wiggle 0.5s ease-in-out',
        'slide-in-left': 'slide-in-left 200ms ease both',
      },
    },
  },
  plugins: [],
};

export default config;
