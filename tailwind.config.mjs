/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}"],
  theme: {
    extend: {
      // (2xl breakpoint is available by default; we don't override screens)
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        source: ['"Source Sans Pro"', "sans-serif"],
      },
      colors: {
        brand: {
          // brand red + dark
          red: "#B3282D",
          darkgray: "#333333",

          // warmgray scale so classes like text-brand-warmgray-700 work
          warmgray: {
            50:  "#F7F7F7",
            100: "#EFEFEF",
            200: "#E3E4E3",
            300: "#D2D4D3",
            400: "#BEC1C0",
            500: "#B0B2B1", // your original hex
            600: "#8F9190",
            700: "#6E706F",
            800: "#4C4E4D",
            900: "#2F3130",
          },
        },
        // optional direct alias so you can use text-brand-red too
        "brand-red": "#B3282D",
      },
      letterSpacing: {
        wide: "0.03em",
        wider: "0.06em",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  safelist: [
    // underline pseudo-element utilities used in nav
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
  plugins: [require("@tailwindcss/forms")],
};
