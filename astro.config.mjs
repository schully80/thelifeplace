import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static', // Cloudflare Pages expects static output
  integrations: [tailwind()],
  vite: {
    build: {
      outDir: 'dist', // matches Cloudflare “Output directory”
      sourcemap: true, // ✅ generate source maps for easier debugging
    },
    css: {
      postcss: {
        // Silence: "A PostCSS plugin did not pass the `from` option..."
        options: { from: undefined },
      },
    },
  },
});