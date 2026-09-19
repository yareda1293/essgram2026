/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand accent ramps
        violet: {
          50: '#f0ecff',
          100: '#e0d9ff',
          200: '#c7baff',
          300: '#a594ff',
          400: '#8b73ff',
          500: '#7c5cff',
          600: '#6b40f5',
          700: '#5a30d4',
          800: '#4a28a8',
          900: '#3d2385',
        },
        coral: {
          50: '#fff0ed',
          100: '#ffe0d8',
          200: '#ffc4b5',
          300: '#ffa088',
          400: '#ff7d5e',
          500: '#ff5a3c',
          600: '#ed3f22',
          700: '#c93219',
          800: '#a52914',
          900: '#872215',
        },
        pink: {
          50: '#fff0f6',
          100: '#ffe0ec',
          200: '#ffc1d9',
          300: '#ff97bd',
          400: '#ff6c9e',
          500: '#ff4784',
          600: '#ed2a6b',
          700: '#c41d54',
          800: '#a31948',
          900: '#85173e',
        },
        // Deep navy/charcoal surfaces
        ink: {
          50: '#e8eaf0',
          100: '#c5c9d6',
          200: '#9aa1b4',
          300: '#6e7690',
          400: '#4a5274',
          500: '#2e3552',
          600: '#212842',
          700: '#171c33',
          800: '#0f1326',
          900: '#0a0d1c',
          950: '#060812',
        },
        // Semantic
        success: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        error: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        info: {
          400: '#60a5fa',
          500: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      borderWidth: {
        '3': '3px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(124, 92, 255, 0.45)',
        'glow-coral': '0 0 24px -4px rgba(255, 90, 60, 0.45)',
        'glow-pink': '0 0 24px -4px rgba(255, 71, 132, 0.45)',
        glass: '0 8px 32px -8px rgba(0, 0, 0, 0.6)',
        'glass-sm': '0 4px 16px -4px rgba(0, 0, 0, 0.4)',
        float: '0 12px 40px -12px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'gradient-violet-coral': 'linear-gradient(135deg, #7c5cff 0%, #ff4784 50%, #ff5a3c 100%)',
        'gradient-violet-pink': 'linear-gradient(135deg, #6b40f5 0%, #ff4784 100%)',
        'gradient-coral-pink': 'linear-gradient(135deg, #ff5a3c 0%, #ff4784 100%)',
        'gradient-surface': 'linear-gradient(180deg, rgba(46, 53, 82, 0.4) 0%, rgba(15, 19, 38, 0.6) 100%)',
        'gradient-hero': 'linear-gradient(160deg, #171c33 0%, #0a0d1c 100%)',
        'gradient-shimmer': 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.06) 50%, transparent 75%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-in-up': 'slideInUp 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
        'scale-out': 'scaleOut 0.2s ease-in forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'typing-dot': 'typingDot 1.4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'ripple': 'ripple 0.6s ease-out',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'progress': 'progress 1s linear infinite',
        'spin-slow': 'spin 2s linear infinite',
        'ring': 'ring 1s ease-in-out infinite',
        'moment-progress': 'momentProgress 5s linear forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.92)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        typingDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-6px)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        ring: {
          '0%, 100%': { transform: 'rotate(0)' },
          '50%': { transform: 'rotate(15deg)' },
        },
        momentProgress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
};
