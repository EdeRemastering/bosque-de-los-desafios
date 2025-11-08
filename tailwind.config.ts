import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "roll": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "jump": {
          "0%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-30px) scale(1.1)" },
          "100%": { transform: "translateY(0) scale(1)" },
        },
        "hop": {
          "0%": { transform: "translateY(0) scale(1)" },
          "30%": { transform: "translateY(-20px) scale(1.05)" },
          "60%": { transform: "translateY(-10px) scale(1.02)" },
          "100%": { transform: "translateY(0) scale(1)" },
        },
        "run": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-5px) rotate(-2deg)" },
          "75%": { transform: "translateY(-5px) rotate(2deg)" },
        },
        "fly": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-15px) rotate(-5deg)" },
          "50%": { transform: "translateY(-20px) rotate(0deg)" },
          "75%": { transform: "translateY(-15px) rotate(5deg)" },
        },
        "crawl": {
          "0%, 100%": { transform: "translateY(0) scaleX(1)" },
          "50%": { transform: "translateY(2px) scaleX(0.95)" },
        },
        "glide": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(-3deg)" },
        },
        "bounce": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-25px) scale(1.15)" },
        },
        "walk": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-3px) rotate(-1deg)" },
          "75%": { transform: "translateY(-3px) rotate(1deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse": "pulse 2s infinite",
        "roll": "roll 0.5s ease",
        "bounce-slow": "bounce 2s infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
        "jump": "jump 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "hop": "hop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "run": "run 0.7s ease-out infinite",
        "fly": "fly 0.5s ease-in-out infinite",
        "crawl": "crawl 0.7s linear infinite",
        "glide": "glide 0.75s ease-in-out infinite",
        "bounce": "bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "walk": "walk 0.8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
