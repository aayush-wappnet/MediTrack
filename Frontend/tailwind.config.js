/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,ts,jsx,tsx}', // Adjust based on your project structure
    ],
    theme: {
      extend: {},
    },
    plugins: [],
    corePlugins: {
      colorFormat: 'srgb', // Force Tailwind to use srgb instead of oklch
    },
  };