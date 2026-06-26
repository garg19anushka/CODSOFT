/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        board: "#1F3D2E",
        boardDark: "#142A1F",
        chalk: "#F7F5EF",
        coral: {
          DEFAULT: "#E85D4C",
          dark: "#C8452F",
        },
        pencil: "#F0C14B",
        sage: "#7A9484",
        sageLight: "#B9C9BE",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}

