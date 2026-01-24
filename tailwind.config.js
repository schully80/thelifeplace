/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{astro,md,mdx,html,js,ts,jsx,tsx}',
    './src/layouts/**/*.{astro,md,mdx,html,js,ts,jsx,tsx}',
    './src/components/**/*.{astro,md,mdx,html,js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      fontFamily: {
        // BODY FONT — Montserrat
        body: ['Montserrat', 'system-ui', 'ui-sans-serif', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],

        // HEADING FONT — Montserrat
        heading: ['Montserrat', 'system-ui', 'ui-sans-serif', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],

        // Default sans fallback (used if nothing else specified)
        sans: ['Montserrat', 'system-ui', 'ui-sans-serif', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },

      colors: {
        brand: {
          red: '#B3282D',
        },
      },
    },
  },

  plugins: [],
};
