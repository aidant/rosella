import { PUBLIC_SPOTIFY_CLIENT_ID } from '$env/static/public'
import { db } from '$lib/db'
import { connection } from '$lib/db-connection.schema'
import { credential } from '$lib/db-credential.schema'
import { session } from '$lib/db-session.schema'
import { SpotifyCredentialsSchema } from '$lib/schema-spotify-credentials'
import { decode } from '$lib/util-json'
import { decrypt } from '$lib/util-jwe'
import { error, json } from '@sveltejs/kit'
import { desc, eq, inArray, sql } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ cookies }) => {
  const cookieSession = cookies.get('rosella.session')

  if (!cookieSession) {
    throw error(401, { message: '' })
  }

  const { id: sessionId } = decode<{ id: number }>(await decrypt(cookieSession))

  const entries = await db
    .select({
      access_token: sql`${credential.credential} ->> '$.access_token'`,
      token_type: sql`${credential.credential} ->> '$.token_type'`,
      expires_in: sql`ROUND((JULIANDAY(${credential.createdAt}) - JULIANDAY(CURRENT_TIMESTAMP)) * 86400) + (${credential.credential} ->> '$.expires_in')`,
      refresh_token: sql`${credential.credential} ->> '$.refresh_token'`,
      scope: sql`${credential.credential} ->> '$.scope'`,
    })
    .from(credential)
    .where(
      inArray(
        credential.connectionId,
        db
          .select({ id: connection.id })
          .from(connection)
          .where(
            inArray(
              connection.userId,
              db.select({ userId: session.userId }).from(session).where(eq(session.id, sessionId)),
            ),
          ),
      ),
    )
    .orderBy(desc(credential.createdAt))
    .limit(1)

  let credentials = SpotifyCredentialsSchema.parse(entries[0])

  if (credentials.expires_in <= 0) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refresh_token,
        client_id: PUBLIC_SPOTIFY_CLIENT_ID,
      }),
    })

    const data = await response.json()

    credentials = SpotifyCredentialsSchema.parse(data)

    const [{ id: connectionId }] = await db
      .select({ id: connection.id })
      .from(connection)
      .where(
        inArray(
          connection.userId,
          db.select({ userId: session.userId }).from(session).where(eq(session.id, sessionId)),
        ),
      )
      .limit(1)

    await db.insert(credential).values({
      connectionId,
      credential: credentials,
    })
  }

  return json({
    access_token: credentials.access_token,
    token_type: credentials.token_type,
    expires_in: credentials.expires_in,
    scope: credentials.scope,
  })
}
