/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B9AC4',
        secondary: '#8C3375',
        'secondary-dark': '#702D5E',
      },
    },
  },
  plugins: [],
}
