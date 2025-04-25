import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", 
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        primary2: 'var(--color-primary2)',
        primary7: 'var(--color-primary7)',
        secondary: 'var(--color-secondary)',
        secondary2: 'var(--color-secondary2)',
        success: 'var(--color-success)',
        darkBg: 'var(--color-darkBg)',
        textLight: 'var(--color-textLight)',
        secondaryText: 'var(--color-secondaryText)',
        gray: {
          DEFAULT: 'var(--color-gray)',
          2: 'var(--color-gray2)',
        },
        green: {
          DEFAULT: 'var(--color-green)',
          2: 'var(--color-green2)',
        },
        skyblue: 'var(--color-skyblue)',
        darkText: 'var(--color-darkText)',
        borderDark: 'var(--color-borderDark)',
      },
      fontFamily: {
        poppins: ["var(--font-poppins)"],
        satoshi: ["var(--font-satoshi)"],
        montserrat: ["Montserrat", "sans-serif"],
        'lucida': ['"Lucida Console"', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;