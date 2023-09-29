import type { Config } from 'tailwindcss'
import { default as theme } from 'tailwindcss/defaultTheme'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        text: 'hsl(var(--color-text) / <alpha-value>)',
        background: 'hsl(var(--color-background) / <alpha-value>)',
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        secondary: 'hsl(var(--color-secondary) / <alpha-value>)',
        accent: 'hsl(var(--color-accent) / <alpha-value>)',
      },

      fontFamily: {
        sans: ['Raleway Variable', ...theme.fontFamily.sans],
        serif: ['Fraunces Variable', ...theme.fontFamily.serif],
        mono: ['Fira Code Variable', ...theme.fontFamily.mono],
      },
    },
  },
  plugins: [],
} satisfies Config
