/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        slate2: '#1E293B',
        brand: '#7C3AED',
        number: '#7C3AED',
        algebra: '#2563EB',
        measurement: '#0D9488',
        space: '#EA580C',
        stats: '#DB2777',
        good: '#16A34A',
        warn: '#F59E0B'
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
