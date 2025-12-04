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
        // Primary colors - CSS variables with static fallbacks (Dr. Amy defaults)
        // The CSS variables are injected by ThemeProvider per-tenant
        primary: {
          50: 'var(--color-primary-50, #fdf2f7)',
          100: 'var(--color-primary-100, #fce7f0)',
          200: 'var(--color-primary-200, #fbcfe1)',
          300: 'var(--color-primary-300, #f9a8cd)',
          400: 'var(--color-primary-400, #f472b1)',
          500: 'var(--color-primary-500, #ec4899)',
          600: 'var(--color-primary-600, #db2777)',
          700: 'var(--color-primary-700, #be185d)',
          800: 'var(--color-primary-800, #9d174d)',
          900: 'var(--color-primary-900, #831843)',
        },
        secondary: {
          50: 'var(--color-secondary-50, #faf5ff)',
          100: 'var(--color-secondary-100, #f3e8ff)',
          200: 'var(--color-secondary-200, #e9d5ff)',
          300: 'var(--color-secondary-300, #d8b4fe)',
          400: 'var(--color-secondary-400, #c084fc)',
          500: 'var(--color-secondary-500, #9333ea)',
          600: 'var(--color-secondary-600, #7c3aed)',
          700: 'var(--color-secondary-700, #6b21a8)',
          800: 'var(--color-secondary-800, #581c87)',
          900: 'var(--color-secondary-900, #4c1d95)',
        },
        accent: {
          50: 'var(--color-accent-50, #fef2f2)',
          100: 'var(--color-accent-100, #fee2e2)',
          200: 'var(--color-accent-200, #fecaca)',
          300: 'var(--color-accent-300, #fca5a5)',
          400: 'var(--color-accent-400, #f87171)',
          500: 'var(--color-accent-500, #ef4444)',
          600: 'var(--color-accent-600, #dc2626)',
          700: 'var(--color-accent-700, #b91c1c)',
          800: 'var(--color-accent-800, #991b1b)',
          900: 'var(--color-accent-900, #7f1d1d)',
        },
        trust: {
          blue: 'var(--color-trust-blue, #1e40af)',
          green: 'var(--color-trust-green, #059669)',
          gold: 'var(--color-trust-gold, #d97706)',
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