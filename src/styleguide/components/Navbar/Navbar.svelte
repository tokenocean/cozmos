<script>
  import Fa from "svelte-fa";
  import { faSearch } from "@fortawesome/free-solid-svg-icons";
  import Hamburger from "$components/Hamburger.svelte";
  import Menu from "./Menu.svelte";
  import Logo from "$styleguide/components/Logo.svelte";
  import { headerHeight } from "$lib/store";

  export let mobileScreen = false;
  export let sidebar = false;
</script>

<header
  class:mobileScreen
  class="px-4 py-4 sm:h-14 lg:h-auto fixed top-0 w-full"
  bind:clientHeight={$headerHeight}
>
  <div class="mx-auto flex container items-center justify-between">
    <nav class="flex hambuger navbar-menu">
      <Hamburger bind:open={sidebar} />
    </nav>
    <div>
      <a href="/">
        <Logo class="w-44 lg:w-48 z-20 relative" />
      </a>
    </div>
    <a class="mobileSearch z-20 relative" href="/#market">
      <Fa icon={faSearch} />
    </a>
    <nav class="hidden text-bold lg:block">
      <Menu />
    </nav>
  </div>
</header>

<style lang="scss">
  @import "../../theme.scss";

  header {
    font-family: $header--links--font-family;
    font-size: $header--links--font-size;
    padding-top: 20px;
    background-color: rgba(0, 0, 0, 1);
    color: $header--links--color;
    z-index: 1000000000;

    :global(button.menu-button),
    :global(a.menu-link) {
      transition: 0.15s;
      font-family: $header--links--font-family;
      font-size: $header--links--font-size;
      color: $header--links--color;
    }

    :global(button.menu-button:hover) {
      color: $header--links--hover--color;
    }
  }

  :global(.stickyCustom) {
    background-color: $header--background-color;
  }

  .hambuger {
    display: none;
  }

  .mobileSearch {
    display: none;
  }

  @mixin mobileScreen() {
    .hambuger {
      display: block;
    }

    .mobileSearch {
      display: block;
      font-size: 20px;
    }

    nav {
      z-index: 100;
    }
  }

  @media only screen and (max-width: 1023px) {
    @include mobileScreen();
  }

  header.mobileScreen {
    padding-top: 12px;
    padding-bottom: 12px;
    @include mobileScreen();

    nav {
      @apply hidden;
    }
  }

  :global(nav.navbar-menu svg line) {
    color: $header--hamburger--color;
  }
</style>
