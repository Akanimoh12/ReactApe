/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "neon-green": "#BEFF00",
        "safety-orange": "#FF6B00",
        "bomb-red": "#CC2200",
        "dark-bg": "#0a0a0a",
        "panel-black": "#111111",
      },
      fontFamily: {
        arcade: ['"Press Start 2P"', "monospace"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "fall": "fall linear forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "shake": "shake 0.4s ease-in-out",
        "score-pop": "scorePop 0.3s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "glitch": "glitch 0.3s ease-in-out infinite alternate",
        "scanline": "scanline 8s linear infinite",
        "burst": "burst 0.4s ease-out forwards",
        "confetti": "confetti 1s ease-out forwards",
        "live-pulse": "livePulse 1.5s ease-in-out infinite",
      },
      keyframes: {
        fall: {
          "0%": { transform: "translateY(-60px)" },
          "100%": { transform: "translateY(560px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px #BEFF00, 0 0 20px #BEFF0044" },
          "50%": { boxShadow: "0 0 16px #BEFF00, 0 0 40px #BEFF0088" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
        scorePop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        glitch: {
          "0%": { textShadow: "2px 0 #FF6B00, -2px 0 #BEFF00" },
          "100%": { textShadow: "-2px 0 #FF6B00, 2px 0 #BEFF00" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        burst: {
          "0%": { transform: "scale(0)", opacity: "1" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        confetti: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(-200px) rotate(720deg)", opacity: "0" },
        },
        livePulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};
