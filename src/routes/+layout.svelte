<script lang="ts">
  import '@fontsource-variable/outfit'
  import '@fontsource/atkinson-hyperlegible'
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
