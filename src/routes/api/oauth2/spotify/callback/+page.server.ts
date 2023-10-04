import { base } from '$app/paths'
import { PUBLIC_SPOTIFY_CLIENT_ID } from '$env/static/public'
import { db } from '$lib/db'
import { connection } from '$lib/db-connection.schema'
import { credential } from '$lib/db-credential.schema'
import { session } from '$lib/db-session.schema'
import { user } from '$lib/db-user.schema'
import { SpotifyCredentialsSchema } from '$lib/schema-spotify-credentials'
import { encode as base64url, decode } from '$lib/util-base64-url'
import { encode as json } from '$lib/util-json'
import { decrypt, encrypt } from '$lib/util-jwe'
import { timingSafeEqual } from '$lib/util-timing-safe-equal'
import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import { redirect } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url, cookies }) => {
  const code = url.searchParams.get('code')
  const stateFromSpotify = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  const errorURI = url.searchParams.get('error_uri')

  if (!code) {
    return {
      error,
      errorDescription,
      errorURI,
    }
  }

  const cookieState = cookies.get('rosella.oauth2.spotify.state')
  const cookieVerifier = cookies.get('rosella.oauth2.spotify.verifier')

  if (!cookieState || !cookieVerifier || !stateFromSpotify) {
    return
  }

  const state = await decrypt(cookieState)
  const verifier = base64url(await decrypt(cookieVerifier))

  if (!timingSafeEqual(state, decode(stateFromSpotify))) {
    return
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${url.origin}${url.pathname}`,
      client_id: PUBLIC_SPOTIFY_CLIENT_ID,
      code_verifier: verifier,
    }),
  })

  const data = await response.json()

  const spotifyCredentials = SpotifyCredentialsSchema.parse(data)

  const spotify = SpotifyApi.withAccessToken(PUBLIC_SPOTIFY_CLIENT_ID, data)
  const profile = await spotify.currentUser.profile()

  const sessionId = await db.transaction<number>(async (tx) => {
    let userId: number
    let connectionId: number

    const connections = await tx
      .update(connection)
      .set({ updatedAt: new Date() })
      .where(and(eq(connection.provider, 'spotify'), eq(connection.providerId, profile.id)))
      .returning({ id: connection.id, userId: connection.userId })

    userId = connections[0]?.userId
    connectionId = connections[0]?.id

    if (!userId || !connectionId) {
      const users = await tx.insert(user).values({}).returning({ id: user.id })
      userId = users[0].id

      const connections = await tx
        .insert(connection)
        .values({ provider: 'spotify', providerId: profile.id, userId })
        .returning({ id: connection.id })

      connectionId = connections[0].id
    }

    await tx.insert(credential).values({ connectionId, credential: spotifyCredentials })

    const sessions = await tx.insert(session).values({ userId }).returning({ id: session.id })

    return sessions[0].id
  })

  cookies.delete('rosella.oauth2.spotify.state')
  cookies.delete('rosella.oauth2.spotify.verifier')
  cookies.set('rosella.session', await encrypt(json({ id: sessionId })), {
    httpOnly: true,
    path: '/',
    secure: import.meta.env.PROD,
    sameSite: 'lax',
  })

  throw redirect(302, new URL(`${url.origin}${base}/play`))
}
