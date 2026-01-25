import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://thelifeplace.org",
  devToolbar: {
    enabled: false,
  },

  integrations: [
    tailwind(),
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
  ],

  vite: {
    define: {
      "process.env": process.env,
    },
  },
});
