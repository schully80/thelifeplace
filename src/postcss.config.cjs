module.exports = {
  plugins: {
    // Removed `postcss-import` due to PostCSS `from` warning in Vite/Astro environments.
    // Re-add only if you actually rely on CSS `@import` - otherwise Tailwind + autoprefixer are enough.
    tailwindcss: {},
    autoprefixer: {},
    // If you use nesting, prefer the official one:
    // 'postcss-nesting': {}
  },
};
