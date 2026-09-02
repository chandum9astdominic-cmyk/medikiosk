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
        kiosk: {
          bg: "#F8FAFC", // soft clean background
          card: "#FFFFFF",
          border: "#E2E8F0",
          primary: "#0F766E", // Trustworthy Ayush/Healthcare Teal
          primaryHover: "#0D9488",
          primaryActive: "#115E59",
          secondary: "#0284C7", // Calming Sky Blue
          accent: "#D97706",
          dark: "#0F172A",
          muted: "#475569",
          light: "#F1F5F9",
          dangerBg: "#FEF2F2",
          dangerBorder: "#FCA5A5",
          dangerText: "#991B1B",
          successBg: "#F0FDF4",
          successBorder: "#86EFAC",
          successText: "#166534",
        }
      },
      fontSize: {
        'kiosk-xs': ['1rem', '1.5rem'],
        'kiosk-sm': ['1.125rem', '1.75rem'],
        'kiosk-base': ['1.25rem', '2rem'],
        'kiosk-lg': ['1.5rem', '2.25rem'],
        'kiosk-xl': ['1.875rem', '2.5rem'],
        'kiosk-2xl': ['2.25rem', '2.75rem'],
        'kiosk-3xl': ['3rem', '1.2'],
      },
      minHeight: {
        'touch': '64px',
        'touch-lg': '76px',
      },
      minWidth: {
        'touch': '64px',
        'touch-lg': '76px',
      }
    },
  },
  plugins: [],
};
