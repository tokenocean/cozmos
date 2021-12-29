<script>
  import Search from "$styleguide/components/Search.svelte";
  import WalletPopup from "$styleguide/components/WalletPopup.svelte";
	import UserPopup from "$styleguide/components/UserPopup.svelte";
  import Fa from "svelte-fa";
  import { faWallet, faUser } from "@fortawesome/free-solid-svg-icons";
  import { user } from "$lib/store";
  import {clickOutside} from '$lib/svelte-actions';
	import { prompt } from "$lib/store";
	import { ConnectWallet } from "$comp";

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

	// user handleUserClickOutside
	let userToggleHandler;
	let displayUser = false;
	let toggleUser = () => {
		displayUser = !displayUser;
	};

	function handleUserClickOutside(e) {
		if(displayUser) {
			if(userToggleHandler !== e.detail.target && !userToggleHandler.contains(e.detail.target)) {
				displayUser = false;
			}
		}
	}

	let showConnect = () => {
		$prompt = {
			component: ConnectWallet,
			hide: true,
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
    <div class="relative flex hidden lg:flex">
      <button class='toggleUser' on:click={toggleUser} bind:this={userToggleHandler}>
        <Fa icon={faUser} size="1.5x"/>
      </button>
			<div use:clickOutside on:clickOutside={handleUserClickOutside}>
        {#if displayUser}
        <UserPopup on:click={toggleUser}/>
      {/if}
      </div>
    </div>
  {:else}
    <a href="" class="menu-link"><button class="menu-link-button" on:click={showConnect}>Connect wallet</button></a>
		<a href="/login" class="menu-link"><button class="menu-link-button">Login</button></a>
  {/if}
</div>
