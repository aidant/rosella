import { base } from '$app/paths'
import { PUBLIC_SPOTIFY_CLIENT_ID } from '$env/static/public'
import { db } from '$lib/db'
import { SessionSchema } from '$lib/db-session.schema'
import { SpotifyCredentialsSchema } from '$lib/schema-spotify-credentials'
import { encode as base64url, decode } from '$lib/util-base64-url'
import { decrypt, encrypt } from '$lib/util-jwe'
import { timingSafeEqual } from '$lib/util-timing-safe-equal'
import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import { redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { parse } from 'uuid'
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

  const [{ sessionId }] = await db
    .insert(SessionSchema)
    .values({
      provider: 'spotify',
      providerId: profile.id,

      credentialAccessToken: spotifyCredentials.access_token,
      credentialTokenType: spotifyCredentials.token_type,
      credentialExpiresIn: spotifyCredentials.expires_in,
      credentialRefreshToken: spotifyCredentials.refresh_token,
      credentialScope: spotifyCredentials.scope.split(' ').sort(),
    })
    .returning({ sessionId: SessionSchema.id })
    .onConflictDoUpdate({
      target: SessionSchema.id,
      set: {
        credentialAccessToken: spotifyCredentials.access_token,
        credentialTokenType: spotifyCredentials.token_type,
        credentialExpiresIn: spotifyCredentials.expires_in,
        credentialRefreshToken: spotifyCredentials.refresh_token,
        credentialScope: spotifyCredentials.scope.split(' ').sort(),

        updatedAt: new Date(),
      },
      where: eq(SessionSchema.provider, 'spotify'),
    })

  cookies.delete('rosella.oauth2.spotify.state')
  cookies.delete('rosella.oauth2.spotify.verifier')
  cookies.set('rosella.session', await encrypt(parse(sessionId)), {
    httpOnly: true,
    path: '/',
    secure: import.meta.env.PROD,
    sameSite: 'lax',
  })

  throw redirect(302, new URL(`${url.origin}${base}/play`))
}
