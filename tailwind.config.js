/**
 * 360 Tours Ghana — client brand palette (Aug 2026).
 * Primary green dominant · Gold for CTAs · Red sparingly (~5%) · Warm white base.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            DEFAULT: "#006B3C",
            dark: "#00512F",
            light: "#0A8A54",
          },
          secondary: {
            DEFAULT: "#174A35",
            dark: "#0F3324",
            light: "#1F5C42",
          },
          accent: {
            DEFAULT: "#F2C500",
            dark: "#D9B200",
            light: "#FFD84D",
          },
          red: {
            DEFAULT: "#CE1126",
            dark: "#A20D1E",
            light: "#E5384B",
          },
          charcoal: {
            DEFAULT: "#111111",
            light: "#1C1C1C",
          },
          cream: "#FAF8F2",
          sand: "#D8B98A",
          ink: "#111111",
          muted: "#5C5348",
          border: "#E8DFD0",

          /* legacy aliases */
          green: {
            DEFAULT: "#006B3C",
            dark: "#00512F",
            light: "#0A8A54",
          },
          orange: {
            DEFAULT: "#CE1126",
            dark: "#A20D1E",
          },
          gold: {
            DEFAULT: "#F2C500",
            light: "#FFD84D",
          },
        },
      },
      maxWidth: {
        "8xl": "96rem",
      },
      fontFamily: {
        sans: ["Onest", "system-ui", "sans-serif"],
        heading: ["Bricolage Grotesque", "Onest", "system-ui", "sans-serif"],
        display: ["Bricolage Grotesque", "Onest", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        "kente-wide": "0.28em",
      },
      backgroundImage: {
        "kente-stripe":
          "repeating-linear-gradient(90deg, #CE1126 0 18px, #F2C500 18px 36px, #006B3C 36px 54px, #111111 54px 72px)",
        "kente-band":
          "linear-gradient(90deg, #CE1126 0%, #CE1126 33.33%, #F2C500 33.33%, #F2C500 66.66%, #006B3C 66.66%, #006B3C 100%)",
        "ghana-warm": "linear-gradient(135deg, #174A35 0%, #006B3C 45%, #111111 100%)",
        "ghana-sun": "linear-gradient(135deg, #F2C500 0%, #CE1126 100%)",
      },
      boxShadow: {
        kente: "0 22px 60px -30px rgba(0, 107, 60, 0.4)",
        "kente-lg": "0 34px 90px -40px rgba(17, 17, 17, 0.45)",
        gold: "0 16px 40px -18px rgba(242, 197, 0, 0.5)",
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        "marquee-reverse": "marquee-reverse 38s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "float-slow": "float-slow 7s ease-in-out infinite",
        shimmer: "shimmer 2.6s linear infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "kente-slide": "kente-slide 18s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "70%": { transform: "scale(1.35)", opacity: "0" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        "kente-slide": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "288px 0" },
        },
      },
    },
  },
  plugins: [],
};
