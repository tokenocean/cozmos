<script>
  import Menu from "$styleguide/components/Navbar/Menu.svelte";

  export let open = false;

</script>


<aside
  class="fixed w-full h-full border-r-2 shadow-lg sideBar"
  on:click={() => (open = false)}
  class:open>
  <div class="menu-container">
  </div>
</aside>
