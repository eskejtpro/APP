/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./preview/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fitness: {
          bg: '#0F1218',
          card: '#181E29',
          surface: '#1F2736',
          border: '#2C384E',
          accent: '#10B981', // Neon Green
          amber: '#F59E0B',
          cyan: '#06B6D4',
          red: '#EF4444',
          text: '#F8FAFC',
          muted: '#94A3B8'
        }
      }
    },
  },
  plugins: [],
}
