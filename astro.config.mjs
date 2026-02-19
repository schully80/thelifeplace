import { defineConfig } from "astro/config";
// tailwind integration intentionally disabled for Tailwind v4 PostCSS plugin testing.
// We'll rely on @tailwindcss/postcss in PostCSS config instead.
// import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";


export default defineConfig({
  site: "https://thelifeplace.org",
  adapter: cloudflare({ imageService: "compile" }),
  output: "server",
  devToolbar: {
    enabled: false,
  },
  // Adapter-level imageService set to compile to allow image optimizations at build time

  integrations: [
    // tailwind(),
    sitemap({
      filter: (page) => {
        if (!page || !page.pathname) return true;
        
        const p = page.pathname;

        // ✅ Exclude test / draft / legacy routes from sitemap
        const blocked =
          p.includes("test") ||
          p.includes(".old") ||
          p.includes(".off") ||
          p.includes("register-error") ||
          p.includes("success-test") ||
          p.includes("give-test") ||
          p.includes("splash-test") ||
          p.includes("addressfields-test") ||
          p.includes("test-address") ||
          p.includes("test-places");

        return !blocked;
      },
    }),
    react(),
  ],

  // Avoid passing full process.env into Vite define (security risk).
  // Vite/ Astro exposes import.meta.env for runtime env access; only define specific vars here if needed.
});
