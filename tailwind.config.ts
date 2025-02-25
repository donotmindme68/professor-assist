import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    // extend: {
    //   colors: {
    //     background: 'var(--background)',
    //     foreground: 'var(--foreground)',
    //     primary: {
    //       DEFAULT: 'var(--primary)',
    //       foreground: 'var(--primary-foreground)',
    //     },
    //     muted: {
    //       DEFAULT: 'var(--muted)',
    //       foreground: 'var(--muted-foreground)',
    //     },
    //     card: {
    //       DEFAULT: 'var(--card)',
    //       foreground: 'var(--card-foreground)',
    //     },
    //   },
    //   animation: {
    //     'gradient': 'gradient 8s linear infinite',
    //   },
    //   keyframes: {
    //     gradient: {
    //       '0%, 100%': {
    //         'background-size': '200% 200%',
    //         'background-position': 'left center',
    //       },
    //       '50%': {
    //         'background-size': '200% 200%',
    //         'background-position': 'right center',
    //       },
    //     },
    //   },
    // },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
