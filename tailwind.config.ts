import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Noblekase brand palette
        bg: {
          base: "#FAF8F4",
          warm: "#F2EDE3",
          cream: "#ECE5D7",
        },
        ink: {
          primary: "#1F1F1F",
          secondary: "#6B6862",
          tertiary: "#A09B91",
        },
        accent: {
          DEFAULT: "#A0522D",
          light: "#D4A88A",
          soft: "#FAEEDA",
        },
        border: {
          light: "#E8E2D6",
          mid: "#D4CEC0",
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        "eyebrow": ["11px", { lineHeight: "1.4", letterSpacing: "0.15em" }],
      },
      letterSpacing: {
        wider: "0.06em",
        widest: "0.15em",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        "soft": "0 2px 16px rgba(0, 0, 0, 0.04)",
        "lift": "0 8px 32px rgba(0, 0, 0, 0.06)",
        "deep": "0 16px 40px rgba(0, 0, 0, 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.7s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
