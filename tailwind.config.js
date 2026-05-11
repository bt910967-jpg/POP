/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        kanit: ['Kanit', 'sans-serif'],
      },
      colors: {
        bg: '#0C0C0C',
        primary: '#D7E2EA',
        'accent-dark': '#646973',
        'accent-light': '#BBCCD7',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, #646973 0%, #BBCCD7 100%)',
      },
    },
  },
  plugins: [],
}
