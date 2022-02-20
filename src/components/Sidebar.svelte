<script>
  import { Search } from "$comp";
  import { session } from "$app/stores";
  import branding from "$lib/branding";

  import { prompt } from "$lib/store";

  import { ConnectWallet } from "$comp";
  export let open = false;
  let toggle = () => {
    open = !open;
  };

  let toggleAndPrompt = () => {
    open = !open;
    showConnect();
  };

  let showConnect = () => {
    $prompt = {
      component: ConnectWallet,
      hide: true,
      rainbow: true,
    };
  };
</script>

<aside
  class="-left-full top-0 z-20 fixed w-full h-full shadow-lg sideBar {open
    ? 'open'
    : 'close'}"
  on:click={() => (open = false)}
  class:open
>
  <div class="menu-header bg-black h-14" />
  <div
    class="p-5 pb-10 menu-container h-full -left-full background rounded text-white absolute"
  >
    <div class="menu relative">
      <a sveltekit:prefetch href="/#market" class="border-b border-white"
        ><button on:click={toggle} class="text-left">EXPLORE MARKETPLACE</button
        ></a
      >
      {#if $session?.user}
        <a sveltekit:prefetch href="/a/create" class="border-b border-white"
          ><button on:click={toggle} class="text-left"
            >CREATE NFT-EXPERIENCE</button
          ></a
        >
      {:else}<a href="/login" class="border-b border-white"
          ><button on:click={toggle} class="text-left">SIGN IN</button></a
        >
      {/if}

      <a sveltekit:prefetch href="/about" class="border-b border-white"
        ><button on:click={toggle} class="text-left">ABOUT COZMOS</button></a
      >

      <a
        href="https://discord.com/invite/K393aHGV3M"
        target="_blank"
        rel="noreferrer"
        class="border-b border-white"
        ><button on:click={toggle} class="text-left">SUPPORT</button></a
      >
      {#if $session?.user}
        <a sveltekit:prefetch href="/logout" class="border-b border-white"
          ><button on:click={toggle} class="text-left">DISCONNECT</button></a
        >
      {:else}<a href="/register"
          ><button
            on:click={toggleAndPrompt}
            class="mt-2 text-sm p-3 bg-black rounded-full">CREATE WALLET</button
          ></a
        >
      {/if}
      <div class="flex justify-center items-center">
        <a
          href={branding.urls.external.instagram}
          target="_blank"
          rel="noreferrer"
        >
          <img src="/Instagram-02.svg" alt="Instagram" class="w-20" />
        </a>
        <a
          href={branding.urls.external.discord}
          target="_blank"
          rel="noreferrer"
        >
          <img src="/Discord.svg" alt="Discord" class="w-20" />
        </a>
        <a
          href={branding.urls.external.twitter}
          target="_blank"
          rel="noreferrer"
        >
          <img src="/Twitter-02.svg" alt="Twitter" class="w-20" />
        </a>
      </div>
    </div>
  </div>
</aside>

<style lang="scss">
  @import "../styleguide/theme";

  @include mobileSidebarAnimations;

  aside {
    transition: $mobile-sidebar--transition-time ease;
    background-color: $mobile-sidebar--overlay-color;
  }

  .background {
    background: linear-gradient(
      135deg,
      #f28400 0%,
      #ef4baf 43%,
      #173af7 77%,
      #5fefbb 100%
    );
  }

  aside.close {
    animation: hide $mobile-sidebar--transition-time linear forwards;
  }

  aside.open {
    animation: open $mobile-sidebar--transition-time linear forwards;
  }

  .menu-container {
    transition: $mobile-sidebar--transition-time linear;
    width: 100%;
  }

  .open {
    transition: $mobile-sidebar--transition-time;
    @apply left-0;
    .menu-container {
      @apply left-0;
    }
  }

  .menu a {
    font-size: 16px;
    display: block;
    width: 100%;
    padding: 10px;
  }

  @screen lg {
    aside {
      @apply hidden;
    }
  }
</style>
