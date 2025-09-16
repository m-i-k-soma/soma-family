/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  safelist: [
    "bg-yellow-100",
    "bg-pink-100",
    "bg-blue-100",
    "bg-green-100",
    "bg-purple-100"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
