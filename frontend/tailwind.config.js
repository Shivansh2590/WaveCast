/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0a0f',
          900: '#0d0d13',
          850: '#12121a',
          800: '#181820',
          700: '#22222c',
          600: '#33333f',
        },
        brand: {
          DEFAULT: '#f97316',
          light: '#fb923c',
          dark: '#ea580c',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
