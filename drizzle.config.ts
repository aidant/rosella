import 'dotenv/config.js'
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/*.schema.ts',
  driver: 'turso',
  dbCredentials: {
    url: process.env.PRIVATE_TURSO_DB_URL!,
    authToken: process.env.PRIVATE_TURSO_DB_TOKEN!,
  },
  out: './src/lib/.drizzle',
} satisfies Config
