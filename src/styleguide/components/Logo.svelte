<script>
  export let graphic = false;
  export let white = false;
</script>

{#if graphic}
  <img src="/logo-graphic.png" alt="logo" class={$$props.class} />
{:else if white}
  <img src="/branding/logo-white.svg" alt="logo" class={$$props.class} />
{:else}
  <img src="/branding/logo.png" alt="logo" class={$$props.class} />
{/if}
