/** @type {import('tailwindcss').Config} */

// Semantic colours read CSS variables (see src/index.css) so the dark and light
// themes share the same class names.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Charcoal / obsidian base
        charcoal: {
          50: '#090B0F',
          100: '#12151B',
          200: '#1A1E26',
          300: '#232833',
          400: '#2D3340',
          500: '#3A4150',
          600: '#4B5563',
          700: '#6B7280',
          800: '#9CA3AF',
          900: '#D1D5DB',
        },
        // Amber / gold outbreak accent
        amber: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        gold: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
        },
        // Orange secondary
        orange: {
          300: '#fdba74',
          400: '#fb923c',
          500: '#ea580c',
          700: '#9a3412',
        },
        // Muted red critical
        crimson: {
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#991b1b',
          900: '#450a0a',
        },

        // Theme-aware semantic tokens
        canvas: v('canvas'),
        panel: { DEFAULT: v('panel'), 2: v('panel-2'), 3: v('panel-3') },
        line: { DEFAULT: v('line'), strong: v('line-strong') },
        ink: { DEFAULT: v('ink'), muted: v('ink-muted'), faint: v('ink-faint') },
        accent: { DEFAULT: v('accent'), fg: v('accent-fg') },
        danger: v('danger'),
        warn: v('warn'),
        caution: v('caution'),
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'panel': '0 8px 30px -12px rgba(0, 0, 0, 0.7)',
        'glow-amber': '0 0 24px -4px rgba(245, 158, 11, 0.45)',
        'glow-gold': '0 0 24px -4px rgba(250, 204, 21, 0.45)',
        'glow-crimson': '0 0 24px -4px rgba(239, 68, 68, 0.45)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(24px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 220ms ease-out',
        'fade-in': 'fade-in 160ms ease-out',
        'soft-pulse': 'soft-pulse 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
