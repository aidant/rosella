import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { connection } from './db-connection.schema'

export const credential = sqliteTable('credential', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  connectionId: integer('connection_id')
    .references(() => connection.id)
    .notNull(),

  credential: text('credential', { mode: 'json' }).notNull(),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})
