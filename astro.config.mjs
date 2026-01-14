import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",      // SSR on Pages Functions
  adapter: cloudflare(),
});
