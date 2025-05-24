import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

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
          DEFAULT: '#1DB954', // Spotify Green
          dark: '#1ed760',    // Spotify Green (hover)
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Accent Purple
          light: '#A78BFA',   // Lighter Purple
        },
        neutral: {
          DEFAULT: '#4B5563', // Neutral Gray
          light: '#F3F4F6',   // Light Gray
        },
        semantic: {
          success: '#10B981',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '1': '0.25rem',  /* 4px */
        '2': '0.5rem',   /* 8px */
        '3': '0.75rem',  /* 12px */
        '4': '1rem',     /* 16px */
        '5': '1.25rem',  /* 20px */
        '6': '1.5rem',   /* 24px */
        '8': '2rem',     /* 32px */
        '10': '2.5rem',  /* 40px */
        '12': '3rem',    /* 48px */
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
      transitionDuration: {
        '200': '200ms',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: '500',
            },
            strong: {
              color: 'inherit',
            },
            code: {
              color: 'inherit',
            },
            h1: {
              color: 'inherit',
            },
            h2: {
              color: 'inherit',
            },
            h3: {
              color: 'inherit',
            },
            h4: {
              color: 'inherit',
            },
          },
        },
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [
    typography,
  ],
};

export default config; 