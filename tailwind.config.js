/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            DEFAULT: "#154360",
            dark: "#0F3349",
            light: "#1A5270",
          },
          accent: {
            DEFAULT: "#FFDB58",
            dark: "#E6C44E",
            light: "#FFE680",
          },
          /* legacy aliases — map to new palette for gradual migration */
          green: {
            DEFAULT: "#154360",
            dark: "#0F3349",
            light: "#1A5270",
          },
          orange: {
            DEFAULT: "#FFDB58",
            dark: "#E6C44E",
          },
          gold: {
            DEFAULT: "#FFDB58",
            light: "#FFE680",
          },
          cream: "#F4F7FA",
          ink: "#0B1F2E",
          muted: "#4A6274",
          border: "#D4E0EA",
        },
      },
      maxWidth: {
        "8xl": "96rem",
      },
      fontFamily: {
        sans: ["Onest", "system-ui", "sans-serif"],
        heading: ["Onest", "system-ui", "sans-serif"],
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        "marquee-reverse": "marquee-reverse 38s linear infinite",
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
      },
    },
  },
  plugins: [],
};
