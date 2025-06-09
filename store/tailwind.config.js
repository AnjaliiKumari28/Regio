/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hippie-green': {
          '50': '#f5f9f4',
          '100': '#e6f3e5',
          '200': '#cfe5cd',
          '300': '#a6d0a5',
          '400': '#78b276',
          '500': '#508d4e',
          '600': '#427940',
          '700': '#366035',
          '800': '#2d4e2d',
          '900': '#274027',
          '950': '#112211',
        }
      }
    },
  },
  plugins: [],
}