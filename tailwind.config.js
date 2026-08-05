/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          from: { transform: "translateX(30px)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
