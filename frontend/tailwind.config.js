/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#000000',
        panelBg: '#0c0c0c',
        cardBg: '#141414',
        borderCol: '#262626',
        brand: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          500: '#ffffff',
          600: '#d4d4d4',
          700: '#a3a3a3',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'ui-monospace', 'monospace'],
        code: ['"Courier New"', 'Courier', 'monospace'],
        typing: ['"Anthropic Serif"', 'Tiempos Text', '"Iowan Old Style"', '"Apple Garamond"', 'Baskerville', '"Times New Roman"', 'Georgia', 'serif'],
        serif: ['"Anthropic Serif"', 'Tiempos Text', '"Iowan Old Style"', '"Apple Garamond"', 'Baskerville', '"Times New Roman"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}


