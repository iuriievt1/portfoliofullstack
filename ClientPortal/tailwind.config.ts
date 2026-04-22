import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1d2736",
        paper: "#f4f7fb",
        brand: "#0f766e",
        accent: "#dcfce7",
        line: "#d7e0ea"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
};

export default config;
