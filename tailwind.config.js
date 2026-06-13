/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:       '#111210',
        canvas:    '#F7F4EF',
        white:     '#FFFFFF',
        stone:     '#E8E3DA',
        muted:     '#9A9589',
        fire:      '#E8622A',
        'fire-dark':'#C94E1C',
        'fire-light':'#FDF1EB',
        success:   '#2D7A4F',
        'success-light': '#EAF4EE',
        danger:    '#C13B3B',
        'danger-light':  '#FAEAEA',
        warn:      '#B07B1A',
        'warn-light':    '#FDF4E0',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontWeight: {
        700: '700',
        800: '800',
      },
      borderRadius: {
        md: '6px',
        lg: '10px',
        xl: '14px',
      },
    },
  },
  plugins: [],
}
