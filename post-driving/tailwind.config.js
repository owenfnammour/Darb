/** The shared Darb theme, defined entirely within this application. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fbf8f3', surface: '#ffffff', ink: '#0d1726', muted: '#6b7684', line: '#e6dfd4',
        brand: { 50: '#f2f5f9', 100: '#e2e9f1', 200: '#c5d1e0', 300: '#9badc4', 500: '#475f82', 700: '#223653', 800: '#182940', 900: '#0f1c2e' },
        accent: { 50: '#fff8e8', 200: '#ffdc8f', 300: '#fbc75a', 400: '#f4b130', 500: '#e39a12', 600: '#c27d06', 700: '#96600a', 800: '#6e470d' },
      },
      fontFamily: {
        body: ['Public Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Familjen Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '1rem' },
    },
  },
  plugins: [],
};
