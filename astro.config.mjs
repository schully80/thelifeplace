import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from "@astrojs/sitemap";


export default defineConfig({
  site: "https://thelifeplace.org",
  integrations: [sitemap()],
  integrations:[tailwind()],

  vite: {
    define: {
      'process.env': process.env
    }
  }
});
