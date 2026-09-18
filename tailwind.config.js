/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0D1321",
        surface: "#161F33",
        surface2: "#1D2A45",
        border: "#26314A",
        muted: "#8D95A8",
        emergency: "#FF6B4A",
        saving: "#3DDC97",
        enjoyment: "#FFC845"
      }
    }
  },
  plugins: []
};
