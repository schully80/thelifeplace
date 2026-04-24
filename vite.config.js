import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [basicSsl()],
  server: {
    https: true,
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
