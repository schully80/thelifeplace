/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}", // scan all your files
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        brand: {
          red: "#B3282D",   // your main brand red
          dark: "#9f2429",  // darker hover red
        },
      },
      letterSpacing: {
        wide: "0.03em",
        wider: "0.06em",
      },
    },
  },
  plugins: [],
};
