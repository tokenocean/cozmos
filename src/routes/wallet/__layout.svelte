<script>
  import Nav from "./_nav.svelte";
</script>

<div class="container mx-auto flex pb-10 md:pb-0 md:py-20">
  <Nav />
  <div class="wallet-container px-2 md:px-0">
    <div class="w-full md:w-[50%]">
      <slot />
    </div>
  </div>
</div>

<style lang="scss">
  :global(.dark) {
    @apply bg-black text-white p-4;
  }

  :global(.dark input, .dark select) {
    @apply bg-black text-white border;
    border-color: #ef4baf;
  }

  .wallet-container {
    display: flex;
    justify-content: center;
    width: 100%;
    position: relative;
  }

  @media (max-width: 1023px) {
    .container {
      flex-wrap: wrap;
      padding-left: 0;
      padding-right: 0;
    }
  }
</style>
