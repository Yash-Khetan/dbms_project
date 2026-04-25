import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#080D1A',
        surface: 'rgba(255, 255, 255, 0.05)',
        cyan: {
          500: '#00D4FF',
        },
        amber: {
          500: '#FFB800',
        },
        crimson: {
          500: '#FF3D57',
        },
        emerald: {
          500: '#00E396',
        }
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
} satisfies Config;
