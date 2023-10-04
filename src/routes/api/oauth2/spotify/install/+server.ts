import { base } from '$app/paths'
import { PUBLIC_SPOTIFY_CLIENT_ID } from '$env/static/public'
import { encode as base64url } from '$lib/util-base64-url'
import { encrypt } from '$lib/util-jwe'
import { random } from '$lib/util-random'
import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, cookies }) => {
  const spotifyOAuth2AuthorizeURL = new URL('https://accounts.spotify.com/authorize')

  const state = random(64)
  const verifier = random(96)

  spotifyOAuth2AuthorizeURL.searchParams.set('response_type', 'code')
  spotifyOAuth2AuthorizeURL.searchParams.set('client_id', PUBLIC_SPOTIFY_CLIENT_ID)
  spotifyOAuth2AuthorizeURL.searchParams.set(
    'redirect_uri',
    `${url.origin}${base}/api/oauth2/spotify/callback`,
  )

  spotifyOAuth2AuthorizeURL.searchParams.set('state', base64url(state))
  spotifyOAuth2AuthorizeURL.searchParams.set(
    'scope',
    'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming',
  )
  spotifyOAuth2AuthorizeURL.searchParams.set('code_challenge_method', 'S256')
  spotifyOAuth2AuthorizeURL.searchParams.set(
    'code_challenge',
    base64url(
      new Uint8Array(
        await crypto.subtle.digest('SHA-256', new TextEncoder().encode(base64url(verifier))),
      ),
    ),
  )

  const options = {
    httpOnly: true,
    maxAge: 300,
    path: `${url.origin}${base}/api/oauth2/spotify/callback`,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
  } as const

  cookies.set('rosella.oauth2.spotify.state', await encrypt(state), options)
  cookies.set('rosella.oauth2.spotify.verifier', await encrypt(verifier), options)

  throw redirect(302, spotifyOAuth2AuthorizeURL)
}
