<script>
  import { Avatar, Search } from "$comp";
  import { session } from "$app/stores";
  export let open = false;
  let toggle = () => (open = !open);
</script>

<aside
  class="-left-full top-0 z-20 fixed w-full h-full shadow-lg sideBar {open
    ? 'open'
    : 'close'}"
  on:click={() => (open = false)}
  class:open
>
  <div class="menu-header bg-black h-14" />
  <div class="menu-container -left-full bg-white absolute h-screen">
    {#if $session?.user}
      <div class="flex">
        <div>Signed in as:</div>
        <a href={`/${$session.user.username}`}>
          <div class="flex mx-auto">
            <Avatar user={$session.user} />
            <button on:click={toggle}>{$session.user.username}</button>
          </div></a
        >
      </div>
    {/if}
    <div class="menu relative">
      <a sveltekit:prefetch href="/"><button on:click={toggle}>Home</button></a>
      <a sveltekit:prefetch href="/about"
        ><button on:click={toggle}>About</button></a
      >
      <a sveltekit:prefetch href="/wallet"
        ><button on:click={toggle}>Wallet</button></a
      >
      <a href="/support"><button on:click={toggle}>Support</button></a>
      {#if $session?.user}
        {#if $session.user.is_admin}
          <a href="/admin"><button on:click={toggle}>Admin</button></a>
        {/if}
        <a sveltekit:prefetch href="/logout"
          ><button on:click={toggle}>Sign out</button></a
        >
      {:else}<a href="/login"><button on:click={toggle}>Sign In</button></a
        >{/if}
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
