<script>
  import * as animateScroll from "svelte-scrollto";
  import Search from "$styleguide/components/Search.svelte";
  import WalletPopup from "$styleguide/components/WalletPopup.svelte";
  import UserPopup from "$styleguide/components/UserPopup.svelte";
  import Fa from "svelte-fa";
  import { faWallet, faUser } from "@fortawesome/free-solid-svg-icons";
  import { session } from "$app/stores";
  import { clickOutside } from "$lib/svelte-actions";
  import { prompt } from "$lib/store";
  import { ConnectWallet } from "$comp";
  import Button from "$styleguide/components/Button.svelte";
  import { goto } from "$lib/utils";
  import { requirePassword } from "$lib/auth";
  import { Avatar } from "$comp";

  export let open = false;
  let toggle = () => (open = !open);

  let hovering;
  let enter = () => (hovering = true);
  let leave = () => (hovering = false);

  // wallet handler

  let walletToggleHandler;
  let displayWallet = false;
  let toggleWallet = async () => {
    if (!displayWallet) await requirePassword();
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
  {#if $session?.user}
    <div class="relative flex lg:flex">
      <Button
        primary
        class="mr-6 w-40"
        height="h-10"
        rounded="rounded-full"
        on:click={async () => {
          await goto("/");
          animateScroll.scrollTo({ element: "#market" });
        }}>Explore</Button
      >
      <Button
        primary
        class="mr-8 w-40"
        height="h-10"
        rounded="rounded-full"
        on:click={() => goto("/a/create")}>Create</Button
      >
      <button
        class="toggleWallet"
        on:click={toggleWallet}
        bind:this={walletToggleHandler}
      >
        <img
          src="/svg_icons/wallet.svg"
          alt="Wallet icon"
          class="border border-white rounded-full w-12"
        />
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
        <Avatar border="" size="sm" user={$session.user} />
      </button>
      <div use:clickOutside on:clickOutside={handleUserClickOutside}>
        {#if displayUser}
          <UserPopup on:click={toggleUser} />
        {/if}
      </div>
    </div>
  {:else}
    <a href="/#market" class="mr-2"
      ><Button primary rounded="rounded-full" height="h-10" class="w-40"
        >Explore</Button
      ></a
    >
    <a
      href="/wallet"
      class="w-40 mx-2 bg-black rounded-full border border-white text-white px-4 py-1"
      ><button on:click|preventDefault={showConnect}>Create wallet</button></a
    >
    <a
      href="/login"
      class="w-40 mx-2 bg-black rounded-full text-white px-4 py-1 border border-white"
      ><button>Login</button></a
    >
  {/if}
</div>

<style lang="scss">
  div {
    font-family: "Raleway", Helvetica, Arial, sans-serif;
  }

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
