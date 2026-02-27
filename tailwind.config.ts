import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/widgets/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors - CSS variables with neutral defaults
        // The CSS variables are injected by ThemeProvider per-tenant
        primary: {
          50: 'var(--color-primary-50, #f8f8f8)',
          100: 'var(--color-primary-100, #f0f0f0)',
          200: 'var(--color-primary-200, #e4e4e4)',
          300: 'var(--color-primary-300, #d1d1d1)',
          400: 'var(--color-primary-400, #b4b4b4)',
          500: 'var(--color-primary-500, #9a9a9a)',
          600: 'var(--color-primary-600, #6b6b6b)',
          700: 'var(--color-primary-700, #4a4a4a)',
          800: 'var(--color-primary-800, #2d2d2d)',
          900: 'var(--color-primary-900, #1a1a1a)',
        },
        secondary: {
          50: 'var(--color-secondary-50, #fdfdfc)',
          100: 'var(--color-secondary-100, #faf9f7)',
          200: 'var(--color-secondary-200, #f7f3f0)',
          300: 'var(--color-secondary-300, #f0ebe6)',
          400: 'var(--color-secondary-400, #e8dfd7)',
          500: 'var(--color-secondary-500, #ddd0c4)',
          600: 'var(--color-secondary-600, #c9b8a8)',
          700: 'var(--color-secondary-700, #b09d8a)',
          800: 'var(--color-secondary-800, #8f7a65)',
          900: 'var(--color-secondary-900, #6d5a47)',
        },
        accent: {
          50: 'var(--color-accent-50, #fefdf8)',
          100: 'var(--color-accent-100, #fdf9e7)',
          200: 'var(--color-accent-200, #faf1c4)',
          300: 'var(--color-accent-300, #f5e596)',
          400: 'var(--color-accent-400, #efd666)',
          500: 'var(--color-accent-500, #e6c547)',
          600: 'var(--color-accent-600, #d4a574)',
          700: 'var(--color-accent-700, #b8935f)',
          800: 'var(--color-accent-800, #9c7a4a)',
          900: 'var(--color-accent-900, #7a5f39)',
        },
        trust: {
          blue: 'var(--color-trust-blue, #1e40af)',
          green: 'var(--color-trust-green, #059669)',
          gold: 'var(--color-trust-gold, #8b7355)',
        }
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'widget': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'widget-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'cta': '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;