module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin-slow 3s linear infinite",
        "spin-slower": "spin-slower 4s linear infinite",
      },
      keyframes: {
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "spin-slower": {
          to: { transform: "rotate(-360deg)" },
        },
      },
    },
  },
  plugins: [],
};
