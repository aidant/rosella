import { sql } from 'drizzle-orm'
import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})
