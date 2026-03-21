import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f5f7fb",
        accent: "#ff6b3d",
        teal: "#0f766e",
        gold: "#d97706"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.12)"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

