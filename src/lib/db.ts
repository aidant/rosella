import { PRIVATE_TURSO_DB_TOKEN, PRIVATE_TURSO_DB_URL } from '$env/static/private'
import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql'

export const db = drizzle(
  createClient({
    url: PRIVATE_TURSO_DB_URL,
    authToken: PRIVATE_TURSO_DB_TOKEN,
  }),
)
