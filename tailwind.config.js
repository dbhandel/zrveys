/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D2939',
        secondary: '#2970FF',
        'secondary-dark': '#1E4DB7',
      },
    },
  },
  plugins: [],
}
