module.exports = {
  plugins: {
    // put postcss-import FIRST if you use it
    'postcss-import': {},
    // Then Tailwind + autoprefixer
    tailwindcss: {},
    autoprefixer: {},
    // If you use nesting, prefer the official one:
    // 'postcss-nesting': {}
  },
};