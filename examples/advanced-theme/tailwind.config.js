/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './sections/**/*.liquivelte',
    './snippets/**/*.liquivelte',
    './blocks/**/*.liquivelte',
    './layout/**/*.liquid',
    './templates/**/*.json',
    './index.html'
  ],
  safelist: [
    {
      pattern: /bg-gradient-to-r/,
      variants: ['from-primary-50', 'to-primary-100', 'from-primary-600', 'to-primary-700']
    },
    {
      pattern: /text-/,
      variants: ['text-4xl', 'text-6xl', 'text-xl', 'text-2xl', 'text-3xl', 'text-lg', 'text-gray-600', 'text-gray-900', 'text-white']
    },
    {
      pattern: /font-/,
      variants: ['font-bold', 'font-semibold']
    },
    {
      pattern: /mb-/,
      variants: ['mb-6', 'mb-12', 'mb-8', 'mb-2', 'mb-4']
    },
    {
      pattern: /py-/,
      variants: ['py-20', 'py-3', 'py-8']
    },
    {
      pattern: /px-/,
      variants: ['px-4', 'px-6']
    },
    {
      pattern: /grid-/,
      variants: ['grid-cols-1', 'grid-cols-2', 'grid-cols-4']
    },
    {
      pattern: /gap-/,
      variants: ['gap-6']
    },
    {
      pattern: /rounded-/,
      variants: ['rounded-lg', 'rounded-md']
    },
    {
      pattern: /shadow-/,
      variants: ['shadow-md', 'shadow-lg']
    },
    {
      pattern: /hover:/,
      variants: ['hover:bg-primary-700', 'hover:shadow-lg', 'hover:bg-gray-50']
    },
    {
      pattern: /transition-/,
      variants: ['transition-colors']
    },
    {
      pattern: /bg-/,
      variants: ['bg-white', 'bg-primary-600', 'bg-gray-200', 'bg-gray-300']
    },
    {
      pattern: /text-/,
      variants: ['text-red-500', 'text-red-600', 'text-gray-400']
    },
    {
      pattern: /bg-/,
      variants: ['bg-red-500']
    }
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
