import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0A2463',
        accent: '#FF6B35',
        'neutral-dark': '#2C3E50',
        'background-light': '#F5F7FA',
        'background-dark': '#111621',
        background: '#F5F7FA',
        surface: '#FFFFFF',
        'on-surface': '#2C3E50',
        'on-surface-variant': '#64748B',
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [forms, containerQueries],
}
