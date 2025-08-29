import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  output: "static", // ✅ Cloudflare Pages expects static output
  integrations: [tailwind()],
  vite: {
    build: {
      outDir: "dist", // ✅ matches Cloudflare “Output directory”
    },
  },
});