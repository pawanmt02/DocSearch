import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neumorphic: {
          bg: "#e0e5ec",
          light: "#ffffff",
          dark: "#a3b1c6",
          accent: "#4f46e5",
        },
        glass: {
          bg: "#090d16",
          card: "rgba(255, 255, 255, 0.07)",
          border: "rgba(255, 255, 255, 0.12)",
        },
      },
      boxShadow: {
        "neu-flat": "8px 8px 16px #babecc, -8px -8px 16px #ffffff",
        "neu-pressed": "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff",
        "neu-sm": "4px 4px 8px #babecc, -4px -4px 8px #ffffff",
        "neu-convex": "linear-gradient(145deg, #f0f5fc, #cbcfd4)",
        "glass-glow": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};
export default config;
