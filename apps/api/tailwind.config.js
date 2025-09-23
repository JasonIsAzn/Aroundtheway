/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './Views/**/*.{cshtml,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}