import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  server: { port: 4322, host: true, strictPort: true },
  integrations: [tailwind({ applyBaseStyles: true })],
});