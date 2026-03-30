/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2fbf8',
          100: '#d2f4e9',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46'
        },
        ink: {
          900: '#0f172a'
        }
      },
      boxShadow: {
        soft: '0 20px 45px -24px rgba(15, 23, 42, 0.4)'
      }
    }
  },
  plugins: []
};
