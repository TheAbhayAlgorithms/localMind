/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F5F5F7',
        tile: '#FFFFFF',
        ink: '#1D1D1F',
        blue: {
          DEFAULT: '#007AFF',
          tile: '#0066CC',
        },
        green: {
          DEFAULT: '#34C759',
        },
        textMuted: '#4B5563',
        bento: {
          canvas: '#F5F5F7',
          tile: '#FFFFFF',
          ink: '#1D1D1F',
          blue: '#007AFF',
          blueTile: '#0066CC',
          green: '#34C759',
          muted: '#4B5563',
          border: 'rgba(0, 0, 0, 0.06)',
          shadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'ui-monospace', 'monospace'],
        code: ['"Courier New"', 'Courier', 'monospace'],
      }
    },
  },
  plugins: [],
}


