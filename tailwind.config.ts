import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT:               "hsl(var(--sidebar-background))",
          foreground:            "hsl(var(--sidebar-foreground))",
          primary:               "hsl(var(--sidebar-primary))",
          "primary-foreground":  "hsl(var(--sidebar-primary-foreground))",
          accent:                "hsl(var(--sidebar-accent))",
          "accent-foreground":   "hsl(var(--sidebar-accent-foreground))",
          border:                "hsl(var(--sidebar-border))",
          ring:                  "hsl(var(--sidebar-ring))",
        },
        nova: {
          surface1: "hsl(var(--nova-surface-1))",
          surface2: "hsl(var(--nova-surface-2))",
          surface3: "hsl(var(--nova-surface-3))",
          violet:   "hsl(var(--nova-violet))",
          cyan:     "hsl(var(--nova-cyan))",
        },
      },

      borderRadius: {
        // Precise scale matching Linear/Raycast/Framer
        "4":  "4px",
        "6":  "6px",
        sm:   "6px",
        md:   "8px",
        lg:   "10px",
        xl:   "12px",
        "2xl": "16px",
        "3xl": "20px",
      },

      fontSize: {
        // Product-grade type scale
        "2xs": ["10px", { lineHeight: "1.4", letterSpacing: "0" }],
        "3xs": ["9px",  { lineHeight: "1.4", letterSpacing: "0.01em" }],
        xs:    ["11px", { lineHeight: "1.45" }],
        sm:    ["13px", { lineHeight: "1.5"  }],
        base:  ["14px", { lineHeight: "1.55" }],
        lg:    ["16px", { lineHeight: "1.5"  }],
        xl:    ["18px", { lineHeight: "1.4"  }],
        "2xl": ["22px", { lineHeight: "1.3"  }],
        "3xl": ["28px", { lineHeight: "1.2"  }],
        "4xl": ["36px", { lineHeight: "1.1"  }],
      },

      boxShadow: {
        // Precise depth scale
        "focus":  "0 0 0 3px hsl(263 70% 58% / 0.15)",
        "xs":     "0 1px 2px hsl(0 0% 0% / 0.18)",
        "sm":     "0 1px 3px hsl(0 0% 0% / 0.2), 0 1px 2px hsl(0 0% 0% / 0.12)",
        "md":     "0 4px 8px -2px hsl(0 0% 0% / 0.28), 0 2px 4px hsl(0 0% 0% / 0.14)",
        "lg":     "0 8px 20px -4px hsl(0 0% 0% / 0.35), 0 4px 8px hsl(0 0% 0% / 0.15)",
        "xl":     "0 16px 40px -8px hsl(0 0% 0% / 0.45), 0 8px 16px hsl(0 0% 0% / 0.18)",
        "2xl":    "0 32px 64px -16px hsl(0 0% 0% / 0.55)",
        "float":  "0 0 0 0.5px hsl(0 0% 0% / 0.5), 0 4px 6px hsl(0 0% 0% / 0.25), 0 16px 48px hsl(0 0% 0% / 0.45)",
        "glow":   "0 0 20px hsl(263 70% 58% / 0.25), 0 0 40px hsl(263 70% 58% / 0.1)",
        "none":   "none",
      },

      transitionDuration: {
        "75":  "75ms",
        "100": "100ms",
        "150": "150ms",
        "250": "250ms",
        "350": "350ms",
      },

      transitionTimingFunction: {
        "spring":   "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth":   "cubic-bezier(0.2, 0, 0.2, 1)",
        "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(3px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(12px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.35" },
          "50%":       { opacity: "0.9"  },
        },
        "shimmer": {
          from: { backgroundPosition: "-200% 0" },
          to:   { backgroundPosition: "200% 0"  },
        },
      },

      animation: {
        "accordion-down":  "accordion-down 0.18s cubic-bezier(0.2, 0, 0.2, 1)",
        "accordion-up":    "accordion-up   0.18s cubic-bezier(0.2, 0, 0.2, 1)",
        "fade-in":         "fade-in        0.18s cubic-bezier(0.2, 0, 0.2, 1)",
        "slide-in-right":  "slide-in-right 0.2s  cubic-bezier(0.2, 0, 0.2, 1)",
        "scale-in":        "scale-in       0.15s cubic-bezier(0.2, 0, 0.2, 1)",
        "glow-pulse":      "glow-pulse 2s ease-in-out infinite",
        "shimmer":         "shimmer 1.5s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
