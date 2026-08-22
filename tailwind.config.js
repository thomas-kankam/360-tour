/**
 * Palette is derived directly from the 360 Tours Ghana logo:
 * flag green (primary) · flag gold (accent) · flag red (alert/CTA highlight) · logo black (ink).
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            DEFAULT: "#006B3F",
            dark: "#00512F",
            light: "#0A8A54",
          },
          accent: {
            DEFAULT: "#FCD116",
            dark: "#D9B200",
            light: "#FFE571",
          },
          red: {
            DEFAULT: "#CE1126",
            dark: "#A20D1E",
            light: "#E5384B",
          },
          charcoal: {
            DEFAULT: "#0B0B0B",
            light: "#1C1A17",
          },
          cream: "#FCF8F0",
          sand: "#F4EBDA",
          ink: "#17130E",
          muted: "#655C4E",
          border: "#E6DBC6",

          /* legacy aliases — keep older utility names rendering on the new palette */
          green: {
            DEFAULT: "#006B3F",
            dark: "#00512F",
            light: "#0A8A54",
          },
          orange: {
            DEFAULT: "#CE1126",
            dark: "#A20D1E",
          },
          gold: {
            DEFAULT: "#FCD116",
            light: "#FFE571",
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
          "repeating-linear-gradient(90deg, #CE1126 0 18px, #FCD116 18px 36px, #006B3F 36px 54px, #0B0B0B 54px 72px)",
        "kente-band":
          "linear-gradient(90deg, #CE1126 0%, #CE1126 33.33%, #FCD116 33.33%, #FCD116 66.66%, #006B3F 66.66%, #006B3F 100%)",
        "ghana-warm": "linear-gradient(135deg, #00512F 0%, #006B3F 45%, #0B0B0B 100%)",
        "ghana-sun": "linear-gradient(135deg, #FCD116 0%, #CE1126 100%)",
      },
      boxShadow: {
        kente: "0 22px 60px -30px rgba(0, 107, 63, 0.45)",
        "kente-lg": "0 34px 90px -40px rgba(11, 11, 11, 0.5)",
        gold: "0 16px 40px -18px rgba(252, 209, 22, 0.55)",
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
