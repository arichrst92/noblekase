import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Noblekase brand palette — oranye + navy + putih (mengikuti packaging)
        bg: {
          base: "#FFFFFF", // putih bersih
          warm: "#F7F8FA", // section halus (neutral)
          cream: "#EEF1F6", // section pembeda (neutral lebih dalam)
        },
        ink: {
          primary: "#1A2340", // dark navy — teks, footer, tombol
          secondary: "#565E72",
          tertiary: "#949AAB",
        },
        accent: {
          // Oranye brand (vivid orange dari kemasan)
          DEFAULT: "#F15A24",
          light: "#F98950",
          soft: "#FEEDE4",
        },
        navy: {
          // Navy sekunder (badge "Safe & Reliable", dll)
          DEFAULT: "#1B2A63",
          light: "#35468C",
        },
        border: {
          light: "#E8EAF0",
          mid: "#D3D7E1",
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
