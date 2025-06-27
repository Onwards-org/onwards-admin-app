/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/client/**/*.{vue,js,ts,jsx,tsx}',
    './src/client/index.html'
  ],
  theme: {
    extend: {
      colors: {
        'onwards-blue': '#2563eb',
        'onwards-green': '#16a34a',
        'onwards-purple': '#7c3aed'
      }
    }
  },
  plugins: []
}