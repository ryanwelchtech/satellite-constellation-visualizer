/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'space-dark': '#0a0a1a',
        'space-darker': '#050510',
        'space-blue': '#4a9eff',
        'space-cyan': '#00ffff',
        'space-green': '#00ff88',
        'space-orange': '#ff9500',
        'space-purple': '#9d4edd',
      },
      animation: {
        'spin-slow': 'spin 60s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
