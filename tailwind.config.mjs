/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        brand: {
          warmgray: "#B0B2B1",
          darkgray: "#333333",
          red: "#B3282D",
        },
      },
      letterSpacing: {
        wide: "0.03em",
        wider: "0.06em",
      },
    },
  },
  safelist: [
    // pseudo-element setup
    "after:content-['']",
    "after:absolute",
    "after:left-0",
    "after:-bottom-0.5",
    "after:h-[2px]",
    "after:bg-brand-red",
    "after:origin-left",
    "after:transform",
    "after:scale-x-0",
    "hover:after:scale-x-100",
    "after:transition-transform",
    "after:duration-300",
    "text-brand-darkgray",
    "hover:text-brand-red",
  ],
  plugins: [],
};