/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14151A",
        paper: "#FAF8F4",
        amber: {
          DEFAULT: "#E8A33D",
          dark: "#C8842A",
          light: "#F4D9A8",
        },
        slate: {
          DEFAULT: "#5B5F6B",
          light: "#8C8F99",
        },
        leaf: "#3D8361",
        rust: "#C2492A",
      },
      fontFamily: {
        display: ["Archivo", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}

