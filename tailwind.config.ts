import type { Config } from 'tailwindcss'
import { default as theme } from 'tailwindcss/defaultTheme'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display Variable', ...theme.fontFamily.serif],
        sans: ['Atkinson Hyperlegible', ...theme.fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config
