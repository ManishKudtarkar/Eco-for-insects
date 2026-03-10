/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: '#1A3C34',
        moss: '#3E6A53',
        leaf: '#81A88D',
      }
    },
  },
  plugins: [],
}
