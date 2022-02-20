<script>
  import { Search } from "$comp";
  import { session } from "$app/stores";
  import branding from "$lib/branding";
  export let openProfile = false;
  let toggle = () => {
    openProfile = !openProfile;
  };
</script>

<aside
  class="-right-full top-0 z-20 fixed w-full h-full shadow-lg sideBar {openProfile
    ? 'open'
    : 'close'}"
  on:click={() => (openProfile = false)}
  class:openProfile
>
  <div class="menu-header bg-black h-14" />
  <div
    class="p-5 pb-10 menu-container h-full -right-full background rounded text-white absolute"
  >
    <div class="menu relative">
      {#if $session?.user}
        <a
          sveltekit:prefetch
          href={`/${$session.user.username}`}
          class="border-b border-white"
          ><button on:click={toggle} class="flex justify-between items-center"
            >YOUR PROFILE<img
              src="/svg_icons/profile_mobile.png"
              alt="profile icon"
              class="w-4"
            /></button
          ></a
        >
        <a sveltekit:prefetch href="/wallet" class="border-b border-white"
          ><button on:click={toggle} class="flex justify-between items-center"
            >YOUR WALLET<img
              src="/svg_icons/mobile_wallet.png"
              alt="wallet icon"
              class="w-4"
            />
          </button></a
        >

        <a sveltekit:prefetch href="/a/create" class="border-b border-white"
          ><button on:click={toggle} class="text-left"
            >CREATE NFT-EXPERIENCE</button
          ></a
        >

        <a href="/logout"
          ><button
            on:click={toggle}
            class="text-sm mt-2 p-3 bg-black rounded-full">DISCONNECT</button
          ></a
        >
      {:else}
        <p class="text-center">Not signed in.</p>
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

  @include mobileSidebarAnimations2;

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
    @apply right-0;
    .menu-container {
      @apply right-0;
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
