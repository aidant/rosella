<script lang="ts">
  import '@fontsource/atkinson-hyperlegible'
  import '@fontsource/poppins'
  /*
    The following import statement is required to ensure that the CSS from
    src/app.css is included in the build. This is the recommended way to
    include global CSS in SvelteKit. For more information please see the Vite
    documentation:

    https://vitejs.dev/guide/features.html#css
  */
  import '../app.css'
</script>

<!--
  The following <slot> tag is required to ensure that the content of the
  current route is rendered. For more information please see the SvelteKit
  documentation:

  https://kit.svelte.dev/docs/routing#layout-layout-svelte
 -->
<slot />

<style>
  :global(html) {
    background-image: radial-gradient(oklab(var(--color-text) / 0.125) 5%, transparent 5%),
      radial-gradient(oklab(var(--color-text) / 0.125) 5%, transparent 5%);
    background-position:
      0 0,
      0.875rem 0.875rem;
    background-size: 1.75rem 1.75rem;
  }
</style>
