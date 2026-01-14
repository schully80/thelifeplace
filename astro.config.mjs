import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare'; // npm i -D @astrojs/cloudflare

export default defineConfig({
  output: 'server',              // or 'hybrid' (keeps static pages + functions)
  adapter: cloudflare({
    // entry: 'entry' // default is fine
  }),
  site: 'https://thelifeplace.org',
});
