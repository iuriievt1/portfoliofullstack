import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0f766e",
        surface: "#f8fafc",
        ink: "#0f172a",
        muted: "#64748b",
        danger: "#dc2626",
        border: "#e2e8f0"
      },
      borderRadius: {
        "4xl": "28px"
      }
    }
  },
  presets: [require("nativewind/preset")]
};

export default config;
