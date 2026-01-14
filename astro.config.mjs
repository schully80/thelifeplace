import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],

  vite: {
    define: {
      'process.env': process.env
    }
  }
});
