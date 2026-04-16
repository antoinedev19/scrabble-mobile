/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        board: { bg: '#1a0f06', cell: '#C8A96E', border: '#8B6914' },
        tile: { bg: '#F5E6C8', text: '#2D1B0E' },
      },
    },
  },
  plugins: [],
}