/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          dark: '#0B0F17',
          surface: '#111827',
          card: '#162032',
          border: '#1F2E45',
          muted: '#94A3B8',
          accent: '#06B6D4',
          emerald: '#10B981',
          teal: '#14B8A6',
          warning: '#F59E0B',
          danger: '#EF4444',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}

