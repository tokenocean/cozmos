<script>
  import Menu from "$styleguide/components/Navbar/Menu.svelte";

  export let open = false;

</script>

  aside {
    transition: $mobile-sidebar--transition-time ease;
    background-color: $mobile-sidebar--overlay-color;
  }

  aside.close {
    animation: hide $mobile-sidebar--transition-time linear forwards;
  }

  aside.open {
    animation: open $mobile-sidebar--transition-time linear forwards;
  }

  .menu-container {
    transition: $mobile-sidebar--transition-time linear;
    width: 70%;
  }

  .open {
    transition: $mobile-sidebar--transition-time;
    @apply left-0;
    .menu-container {
      @apply left-0;
    }
  }

  @screen lg {
    aside {
      @apply hidden;
    }
  }

  @keyframes changeColor {
    0% {
      background-color: white;
    }
    100% {
      background-color: rgba(3, 3, 3, 0.8);
    }
  }

</style>

<aside
  class="fixed w-full h-full border-r-2 shadow-lg sideBar"
  on:click={() => (open = false)}
  class:open>
  <div class="menu-container">
    <Menu bind:open />
  </div>
</aside>
