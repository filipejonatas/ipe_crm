/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        grafite: {
          DEFAULT: '#1F2A2E',
          700: '#2C3A3F',
          500: '#5A676B',
          300: '#A9B2B4',
        },
        concreto: {
          DEFAULT: '#EDEFEC',
          escuro: '#D9DDD9',
        },
        ipe: {
          DEFAULT: '#E8B21A',
          escuro: '#CF9B0C',
          claro: '#FBF0CC',
        },
        ferrugem: {
          DEFAULT: '#B4501E',
          claro: '#F7E6DC',
        },
        erro: {
          DEFAULT: '#B42318',
          claro: '#FCE8E6',
        },
        mercosul: '#003399',
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
