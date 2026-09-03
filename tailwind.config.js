/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: "#F4F2EC",
          card: "#FAF8F4",
          surface: "#FAF6F0",
          text: "#2D2B2A",
          muted: "#66625C",
          gold: "#C5A059",
          "gold-light": "#E8D8B0",
          green: "#3B7A57",
          "green-light": "#88C09E",
          red: "#C0392B",
          accent: "#2C5E43",
        },
        sdg: {
          3: "#4C9F38", // Good Health
          4: "#C5192D", // Quality Education
          9: "#FD6925", // Industry & Innovation
          11: "#FD9D24", // Sustainable Cities
          13: "#3F7E44", // Climate Action
        }
      },
      boxShadow: {
        "neu-raised": "-7px -7px 16px rgba(255, 255, 255, 0.95), 7px 7px 16px rgba(195, 188, 175, 0.45)",
        "neu-raised-sm": "-4px -4px 9px rgba(255, 255, 255, 0.9), 4px 4px 9px rgba(195, 188, 175, 0.4)",
        "neu-raised-lg": "-12px -12px 25px rgba(255, 255, 255, 0.98), 12px 12px 25px rgba(190, 182, 168, 0.5)",
        "neu-inset": "inset 4px 4px 9px rgba(195, 188, 175, 0.45), inset -4px -4px 9px rgba(255, 255, 255, 0.95)",
        "neu-inset-sm": "inset 2px 2px 5px rgba(195, 188, 175, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.9)",
        "neu-pressed": "inset 3px 3px 7px rgba(190, 182, 168, 0.5), inset -3px -3px 7px rgba(255, 255, 255, 0.9)",
        "neu-gold-glow": "0 0 20px rgba(197, 160, 89, 0.3)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Inter", "sans-serif"],
        heading: ["var(--font-outfit)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
