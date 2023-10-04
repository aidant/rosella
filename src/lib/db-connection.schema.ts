import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { user } from './db-user.schema'

export const connection = sqliteTable('connection', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .references(() => user.id)
    .notNull(),

  provider: text('provider', { enum: ['spotify'] }).notNull(),
  providerId: text('provider_id').unique().notNull(),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})
