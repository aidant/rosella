import { sql } from 'drizzle-orm'
import { int, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { v4 as uuidv4 } from 'uuid'

export const SessionSchema = sqliteTable(
  'session',
  {
    id: text('id')
      .primaryKey()
      .$default(() => uuidv4()),

    provider: text('provider', { enum: ['spotify'] }).notNull(),
    providerId: text('provider_id').notNull(),

    credentialAccessToken: text('credential_access_token').notNull(),
    credentialTokenType: text('credential_token_type', { enum: ['Bearer'] }).notNull(),
    credentialExpiresIn: int('credential_expires_in').notNull(),
    credentialRefreshToken: text('credential_refresh_token').notNull(),
    credentialScope: text('credential_scope', { mode: 'json' }).$type<string[]>().notNull(),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: int('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    _providerId: unique().on(t.provider, t.providerId),
  }),
)
