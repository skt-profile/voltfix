/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Base surfaces — deep charcoal-blue, not pure black
        base: {
          950: "#0A0E14",
          900: "#0F141B",
          800: "#12181F",
          700: "#1A222C",
          600: "#232D39",
        },
        // Signature "volt" accent — the charge-indicator lime
        volt: {
          DEFAULT: "#C8FF3D",
          400: "#D6FF6B",
          500: "#C8FF3D",
          600: "#A6E01F",
          900: "#3A4711",
        },
        // Secondary "charge blue" accent
        charge: {
          DEFAULT: "#3D8BFF",
          400: "#5FA0FF",
          500: "#3D8BFF",
          600: "#2569D6",
        },
        ink: {
          DEFAULT: "#EAF0F5",
          muted: "#8A96A3",
          faint: "#5C6874",
        },
        warn: "#FFB443",
        danger: "#FF5D5D",
        ok: "#3DDC97",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "circuit-fade":
          "linear-gradient(180deg, rgba(200,255,61,0.08) 0%, rgba(200,255,61,0) 60%)",
        "volt-glow": "radial-gradient(circle at 30% 20%, rgba(200,255,61,0.15), transparent 60%)",
      },
      boxShadow: {
        "volt-glow": "0 0 24px -4px rgba(200,255,61,0.35)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.55 },
        },
        chargeFill: {
          from: { strokeDashoffset: "var(--dash-start, 283)" },
          to: { strokeDashoffset: "var(--dash-end, 0)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        chargeFill: "chargeFill 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [],
};
