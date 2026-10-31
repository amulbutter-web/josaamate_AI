/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#101828',
          50: '#f0f4ff',
          100: '#e0e9ff',
          900: '#101828',
        },
        indigo: {
          DEFAULT: '#5145CD',
          400: '#806BFF',
          500: '#5145CD',
          600: '#3d33a8',
        },
        violet: {
          DEFAULT: '#806BFF',
        },
        lavender: {
          DEFAULT: '#F3F0FF',
        },
        background: '#F8F9FC',
        success: '#16A36A',
        warning: '#F59E0B',
        error: '#DC4545',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px 0 rgba(81,69,205,0.12), 0 1px 3px 0 rgba(0,0,0,0.08)',
        sidebar: '4px 0 24px 0 rgba(16,24,40,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
