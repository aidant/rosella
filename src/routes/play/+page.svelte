<script lang="ts">
  import { base } from '$app/paths'
  import { SpotifyApi, emptyAccessToken } from '@spotify/web-api-ts-sdk'

  const sdk = new SpotifyApi({
    setConfiguration() {},
    async getOrCreateAccessToken() {
      return emptyAccessToken
    },
    async getAccessToken() {
      return fetch(`${base}/api/oauth2/spotify/credentials`).then((response) => response.json())
    },
    removeAccessToken() {},
  })
</script>

{#await import('$lib/component-spotify-connect.svelte') then { default: SpotifyConnect }}
  <SpotifyConnect />
{/await}

{#await sdk.player.getPlaybackState() then playback}
  {playback?.progress_ms}
{/await}
