import type { Config } from "tailwindcss";

/**
 * Nawā — Desert Twilight & Celestial Gold
 * Primary tokens also live in `src/app/globals.css` (@theme) for Tailwind v4.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0B0F19",
          slate: "#0F172A",
        },
        celestial: {
          amber: "#F59E0B",
          gold: "#D97706",
        },
        astral: {
          cyan: "#38BDF8",
        },
        muted: {
          emerald: "#10B981",
        },
      },
      boxShadow: {
        "celestial-glow": "0 0 32px -8px rgba(245, 158, 11, 0.45)",
        "astral-glow": "0 0 32px -8px rgba(56, 189, 248, 0.4)",
        "emerald-glow": "0 0 28px -8px rgba(16, 185, 129, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
