<script>
  import { browser } from "$app/env";
  import { onMount, tick } from "svelte";
  import Card from "$styleguide/components/Card.svelte";

  export let filtered;
  export let count;

  let inview = filtered.slice(0, 24);
</script>

<div>
  <div class="sm:grid sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 z-0">
    {#each inview as artwork, i}
      <div class="market-gallery w-full mb-20">
        <Card {artwork} height={350} />
      </div>
    {/each}
  </div>
</div>

<style>
  .market-gallery :global(.card-link img),
  .market-gallery :global(.card-link video) {
    height: 350px;
  }
</style>
