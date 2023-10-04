<script lang="ts">
  import { base } from '$app/paths'
  import { onMount } from 'svelte'

  let success: boolean | null = null

  onMount(async () => {
    const promise = new Promise<void>((resolve) => {
      window.onSpotifyWebPlaybackSDKReady = resolve
    })

    // @ts-expect-error
    await import('https://sdk.scdn.co/spotify-player.js')

    await promise

    const Spotify = window.Spotify

    const player = new Spotify.Player({
      name: 'Rosella',
      volume: 0.5,
      enableMediaSession: true,
      getOAuthToken: (cb) => {
        fetch(`${base}/api/oauth2/spotify/credentials`)
          .then((response) => response.json())
          .then((response) => cb(response.access_token))
      },
    })

    success = await player.connect()

    for (const event of [
      'ready',
      'not_ready',
      'player_state_changed',
      'autoplay_failed',
      'account_error',
      'authentication_error',
      'initialization_error',
      'playback_error',
    ]) {
      player.on(event as any, console.log.bind(console, event))
    }
  })
</script>

Media playback SDK connection successful {success}
