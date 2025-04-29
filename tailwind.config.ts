import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16a34a', // Green-600
          dark: '#15803d',    // Green-700
        },
        secondary: {
          DEFAULT: '#4b5563', // Gray-600
          light: '#6b7280',   // Gray-500
        },
        background: '#f9fafb', // Gray-50
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '4': '1rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
      },
    },
  },
  plugins: [],
};

export default config; 