<script>
  export let open = false;
</script>

<span
  class="text-gray-500 hover:text-gray-700 cursor-pointer border-none focus:outline-none p-0"
  class:open
  on:click={() => (open = !open)}
>
  <img src="/svg_icons/hamburger.png" alt="hamburger" class="w-6" />
</span>
