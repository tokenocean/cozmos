<script>
  import Search from "$styleguide/components/Search.svelte";
  import WalletPopup from "$styleguide/components/WalletPopup.svelte";
  import Fa from "svelte-fa";
  import { faWallet, faUser } from "@fortawesome/free-solid-svg-icons";
  import { user } from "$lib/store";
  import {clickOutside} from '$lib/svelte-actions';

  export let open = false;
  let toggle = () => (open = !open);

  let hovering;
  let enter = () => (hovering = true);
  let leave = () => (hovering = false);

  // wallet handler

  let walletToggleHandler;
  let displayWallet = false;
  let toggleWallet = () => {
    displayWallet = !displayWallet;
  };

  function handleWalletClickOutside(e) {
    if(displayWallet) {
      if(walletToggleHandler !== e.detail.target && !walletToggleHandler.contains(e.detail.target)) {
        displayWallet = false;
      }
    }
  }
</script>

<style lang="scss">
  @import "../../theme";

  .menu button {
    @apply w-auto text-left px-5;
  }

  @screen till-lg {
    .menu {
      @apply flex-col w-full mt-8;
    }

    .menu a {
      @apply my-2;
    }

    .menu a.menu-link button.menu-link-button {
      @apply text-xl leading-normal font-semibold;
    }

    .menu :global(.search) {
      @apply hidden;
    }
  }
</style>

<div class="flex justify-between text-center items-center menu relative whitespace-nowrap">
  {#if $user}
    {#if $user.is_admin}
      <a class="menu-link" href="/admin"><button on:click={toggle}>Admin</button></a>
    {/if}
    <div class="relative flex hidden lg:flex">
      <button class="toggleWallet" on:click={toggleWallet} bind:this={walletToggleHandler}>
        <Fa icon={faWallet} size="1.5x"/>
      </button>
      <div use:clickOutside on:clickOutside={handleWalletClickOutside}>
        {#if displayWallet}
        <WalletPopup on:click={toggleWallet}/>
      {/if}
      </div>
    </div>
    <a href={`/u/${$user.username}`} class="hidden lg:inline-block">
      <button on:click={toggle} class="flex">
        <Fa icon={faUser} size="1.5x"/>
      </button>
    </a>
  {:else}
    <a href="/login" class="menu-link"><button class="menu-link-button" on:click={toggle}>Sign In</button></a>
  {/if}
</div>
