const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  mode: 'jit',
  future: {
    purgeLayersByDefault: true,
    applyComplexClasses: true,
  },
  purge: {
    content: [
      './public/**/*.html',
      './components/**/*.{js,ts,jsx,tsx}',
      './components_new/**/*.{js,ts,jsx,tsx}',
      './pages/**/*.{js,ts,jsx,tsx}',
    ],
    options: {
      safelist: {
        standard: ['outline-none'],
      },
    },
  },
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1160px',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      blue: colors.blue,
      white: colors.white,
      gray: colors.trueGray,
      indigo: colors.indigo,
      teal: colors.teal,
      red: colors.rose,
      green: colors.green,
      yellow: {
        light: '#F9B004',
        DEFAULT: '#FAAF04',
        dark: '#FAAF04',
      },
      primary: '#fc004a',
      secondary: '#2F5E8E',
      blue: '#3D6B9A',
    },
    extend: {
      fontFamily: {
        sans: ['Ubuntu', ...defaultTheme.fontFamily.sans],
        serif: ['Ubuntu', ...defaultTheme.fontFamily.serif],
        mono: [...defaultTheme.fontFamily.mono],
      },
      gradientColorStops: (theme) => ({
        ...theme('colors'),
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/custom-forms'),
    require('tailwind-scrollbar-hide'),
  ],
}
