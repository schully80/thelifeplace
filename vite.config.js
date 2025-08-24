import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 4322,       // permanent port
    host: true,
    strictPort: true, // forces 4322
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'dev.thelifeplace.org',
    ],
  },
});