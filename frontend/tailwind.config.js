/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f0f9',
          100: '#d1e1f3',
          200: '#a3c3e7',
          300: '#75a5db',
          400: '#4787cf',
          500: '#1969c3',
          600: '#0a3166',
          700: '#082852',
          800: '#061f3d',
          900: '#041629',
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
