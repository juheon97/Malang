/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'mallang-green': '#00a173',
          'mallang-bg': '#f5fdf5',
        },
        fontFamily: {
          sans: ['HancomSans', 'system-ui', 'sans-serif'],
         
        }
      },
    },
    plugins: [],
  }