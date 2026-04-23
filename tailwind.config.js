/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lego: {
          blue: '#0055BF',
          'blue-dark': '#003D8A',
          red: '#C91A09',
          'red-dark': '#8F1206',
          yellow: '#F7D117',
          'yellow-dark': '#C2A20E',
          green: '#237841',
          'green-dark': '#15502A',
          bg: '#F5F3EE',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        body: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      maxWidth: {
        phone: '480px',
      },
    },
  },
  plugins: [],
};
