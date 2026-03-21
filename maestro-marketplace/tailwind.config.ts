import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      colors: {
        background: "hsl(0 0% 100%)",
        foreground: "hsl(150 16% 10%)",
        border: "hsl(150 16% 90%)",
        input: "hsl(150 16% 90%)",
        ring: "hsl(143 60% 35%)",
        primary: {
          DEFAULT: "hsl(143 60% 35%)",
          foreground: "hsl(0 0% 100%)"
        },
        secondary: {
          DEFAULT: "hsl(140 20% 96%)",
          foreground: "hsl(150 16% 15%)"
        },
        muted: {
          DEFAULT: "hsl(140 20% 97%)",
          foreground: "hsl(150 8% 40%)"
        },
        accent: {
          DEFAULT: "hsl(142 44% 94%)",
          foreground: "hsl(150 16% 12%)"
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(150 16% 10%)"
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "hsl(0 0% 100%)"
        }
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(18, 48, 27, 0.08)",
        card: "0 12px 30px rgba(18, 48, 27, 0.06)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
