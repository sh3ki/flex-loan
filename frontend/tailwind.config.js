/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#FACC15',
        background: '#F8FAFC',
        card: '#FFFFFF',
        text: '#0F172A',
        border: '#E2E8F0',
      },
    },
  },
  plugins: [],
}
