import type { Config } from 'tailwindcss'
import { default as theme } from 'tailwindcss/defaultTheme'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        text: 'oklab(var(--color-text) / <alpha-value>)',
        background: 'oklab(var(--color-background) / <alpha-value>)',
        primary: 'oklab(var(--color-primary) / <alpha-value>)',
        secondary: 'oklab(var(--color-secondary) / <alpha-value>)',
        accent: 'oklab(var(--color-accent) / <alpha-value>)',
      },

      fontFamily: {
        display: ['Poppins', ...theme.fontFamily.sans],
        body: ['Atkinson Hyperlegible', ...theme.fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config
