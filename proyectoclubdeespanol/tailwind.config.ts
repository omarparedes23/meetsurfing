import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E63946',
          gold: '#F1C40F',
          'red-dark': '#C0303C',
          'gold-dark': '#D4AC0D',
        },
        dark: {
          bg: '#0A0A0F',
          surface: '#12121A',
          surface2: '#1A1A2E',
          border: '#2A2A3E',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient':
          'linear-gradient(135deg, #0A0A0F 0%, #1A0A1E 50%, #0A0A0F 100%)',
        'card-gradient':
          'linear-gradient(135deg, rgba(230,57,70,0.1) 0%, rgba(241,196,15,0.05) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #E63946, 0 0 10px #E63946' },
          '100%': { boxShadow: '0 0 20px #E63946, 0 0 40px #E63946, 0 0 60px #E63946' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
