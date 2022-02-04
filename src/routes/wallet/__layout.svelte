<script>
  import Nav from "./_nav.svelte";
</script>

<div class="container mx-auto flex py-10 md:py-20">
  <Nav />
  <div class="wallet-container px-2 md:px-0">
    <div class="wallet-content">
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

  .wallet-content {
    width: 412px;
  }

  @media (max-width: 1023px) {
    .container {
      flex-wrap: wrap;
      padding-left: 0;
      padding-right: 0;
    }

    .wallet-content {
      width: 100%;
    }
  }
</style>
