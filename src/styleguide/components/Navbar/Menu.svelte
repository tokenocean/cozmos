<script>
  import Search from "$styleguide/components/Search.svelte";
  import WalletPopup from "$styleguide/components/WalletPopup.svelte";
  import UserPopup from "$styleguide/components/UserPopup.svelte";
  import Fa from "svelte-fa";
  import { faWallet, faUser } from "@fortawesome/free-solid-svg-icons";
  import { user } from "$lib/store";
  import { clickOutside } from "$lib/svelte-actions";
  import { prompt } from "$lib/store";
  import { ConnectWallet } from "$comp";
  import Button from "$styleguide/components/Button.svelte";
  import { goto } from "$lib/utils";

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
    if (displayWallet) {
      if (
        walletToggleHandler !== e.detail.target &&
        !walletToggleHandler.contains(e.detail.target)
      ) {
        displayWallet = false;
      }
    }
  }

  // user handleUserClickOutside
  let userToggleHandler;
  let displayUser = false;
  let toggleUser = () => {
    displayUser = !displayUser;
  };

  function handleUserClickOutside(e) {
    if (displayUser) {
      if (
        userToggleHandler !== e.detail.target &&
        !userToggleHandler.contains(e.detail.target)
      ) {
        displayUser = false;
      }
    }
  }

  let showConnect = () => {
    $prompt = {
      component: ConnectWallet,
      hide: true,
    };
  };
</script>

<div
  class="flex justify-between text-center items-center menu relative whitespace-nowrap"
>
  {#if $user}
    <div class="relative flex lg:flex">
      <Button
        primary
        class="mr-6 w-40"
        rounded="rounded-full"
        on:click={() => goto("/#market")}>Explore</Button
      >
      <Button
        primary
        class="mr-8 w-40"
        rounded="rounded-full"
        on:click={() => goto("/a/create")}>Create</Button
      >
      <button
        class="toggleWallet"
        on:click={toggleWallet}
        bind:this={walletToggleHandler}
      >
        <img src="/svg_icons/wallet.svg" alt="Wallet icon" class="w-12" />
      </button>
      <div use:clickOutside on:clickOutside={handleWalletClickOutside}>
        {#if displayWallet}
          <WalletPopup on:click={toggleWallet} />
        {/if}
      </div>
    </div>
    <div class="relative flex lg:flex">
      <button
        class="toggleUser"
        on:click={toggleUser}
        bind:this={userToggleHandler}
      >
        <img src="/svg_icons/profile.svg" alt="Profile icon" class="w-12" />
      </button>
      <div use:clickOutside on:clickOutside={handleUserClickOutside}>
        {#if displayUser}
          <UserPopup on:click={toggleUser} />
        {/if}
      </div>
    </div>
  {:else}
    <a href="/#market" class="mr-8"
      ><Button primary rounded="rounded-full" class="w-40">Explore</Button></a
    >
    <a
      href="/wallet"
      class="w-40 mx-2 bg-black rounded-full text-white px-4 py-1"
      ><button on:click|preventDefault={showConnect}>Connect wallet</button></a
    >
    <a
      href="/login"
      class="w-40 mx-2 bg-black rounded-full text-white px-4 py-1"
      ><button>Login</button></a
    >
  {/if}
</div>

<style lang="scss">
  @import "../../theme";

  .menu button {
    @apply w-auto text-left px-1;
  }

  @screen till-lg {
    .menu {
      @apply flex-col w-full mt-8;
    }

    .menu a {
      @apply my-2;
    }

    .menu :global(.search) {
      @apply hidden;
    }
  }

  @media only screen and (max-width: 1023px) {
    .menu {
      flex-direction: column;
      align-items: flex-start;
      margin-top: 50px;
      border-top: 1px solid gray;
      background: white;
      height: 100vh;
      width: 100%;
    }

    .menu a {
      margin: 25px 0 0 0px;
      width: 100%;
    }
  }
</style>
