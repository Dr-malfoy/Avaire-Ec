// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      colors: {
        gold: "#c9a96e",
        "gold-light": "#e8d5b0",
        cream: "#f5f2ec",
        muted: "#8a8680",
        "dark-muted": "#3a3835",
        black: "#0a0a0a",
        white: "#fafaf8",
        red: "#c0392b",
      },
    },
  },
  plugins: [],
};

export default config;