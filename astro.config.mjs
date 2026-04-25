import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";


export default defineConfig({
  site: "https://thelifeplace.org",
  adapter: cloudflare({ imageService: "compile" }),
  output: "server",
  vite: {
    ssr: {
      external: ["node:fs/promises", "node:path"],
    },
  },
  devToolbar: {
    enabled: false,
  },
  // Adapter-level imageService set to compile to allow image optimizations at build time

  integrations: [
    tailwind(),
    sitemap({
      filter: (page) => {
        if (!page) return true;

        const p = new URL(page).pathname;

        // ✅ Exclude test / draft / legacy routes from sitemap
        const blocked =
          p.startsWith("/admin") ||
          // Avoid catching real routes like `/devotionals`
          p === "/dev" ||
          p.startsWith("/dev/") ||
          p.includes("-preview") ||
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
