import { PUBLIC_SPOTIFY_CLIENT_ID } from '$env/static/public'
import { db } from '$lib/db'
import { SessionSchema } from '$lib/db-session.schema'
import { SpotifyCredentialsSchema } from '$lib/schema-spotify-credentials'
import { decrypt } from '$lib/util-jwe'
import { error, json } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { stringify } from 'uuid'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ cookies }) => {
  const cookieSession = cookies.get('rosella.session')

  if (!cookieSession) {
    throw error(401, { message: '' })
  }

  const sessionId = stringify(await decrypt(cookieSession))

  let [credentials] = await db
    .select({
      access_token: SessionSchema.credentialAccessToken,
      token_type: SessionSchema.credentialTokenType,
      expires_in: sql<number>`ROUND((JULIANDAY(${SessionSchema.createdAt}) - JULIANDAY(CURRENT_TIMESTAMP)) * 86400) + ${SessionSchema.credentialExpiresIn}`,
      refresh_token: SessionSchema.credentialRefreshToken,
      scope: sql<string>`(SELECT GROUP_CONCAT(json_each.value, ' ') FROM JSON_EACH(${SessionSchema.credentialScope}))`,
    })
    .from(SessionSchema)
    .where(eq(SessionSchema.id, sessionId))

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

    credentials = SpotifyCredentialsSchema.parse(await response.json())

    await db
      .update(SessionSchema)
      .set({
        credentialAccessToken: credentials.access_token,
        credentialTokenType: credentials.token_type,
        credentialExpiresIn: credentials.expires_in,
        credentialRefreshToken: credentials.refresh_token,
        credentialScope: credentials.scope.split(' ').sort(),

        updatedAt: new Date(),
      })
      .where(eq(SessionSchema.id, sessionId))
  }

  return json({
    access_token: credentials.access_token,
    token_type: credentials.token_type,
    expires_in: credentials.expires_in,
    scope: credentials.scope,
  })
}
