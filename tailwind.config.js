/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary-red": "#ef4444",
        "primary-blue": "#3b82f6",
        "primary-yellow": "#eab308",
        "primary-green": "#22c55e",
        "red-50": "#fef2f2",
        "blue-50": "#eff6ff",
        "yellow-50": "#fefce8",
        "green-50": "#f0fdf4",
      },
    },
  },
  plugins: [],
};
