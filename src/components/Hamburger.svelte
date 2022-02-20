<script>
  export let open = false;
</script>

<span
  class="text-gray-500 hover:text-gray-700 cursor-pointer border-none focus:outline-none p-0"
  class:open
  on:click={() => (open = !open)}
>
  {#if open}
    <img src="/svg_icons/x.png" alt="x" class="w-4" />
  {:else}
    <img src="/svg_icons/hamburger.png" alt="hamburger" class="w-6" />
  {/if}
</span>
