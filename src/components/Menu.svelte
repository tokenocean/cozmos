<script>
  import { Avatar } from "$comp";
  import Search from "$styleguide/components/Search.svelte";
  import WalletPopup from "$styleguide/components/WalletPopup.svelte";
  import Fa from "svelte-fa";
  import { faWallet, faUser } from "@fortawesome/free-solid-svg-icons";
  import { user } from "$lib/store";
  import { clickOutside } from "$lib/svelte-actions";

  export let open = false;
  let toggle = () => (open = !open);

</script>

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

</script>

<style>
  .menu button {
    width: auto;
    text-align: left;
    padding: 0 20px;
  }

  @media only screen and (max-width: 1023px) {
    .menu {
      flex-direction: column;
      align-items: flex-start;
      margin-top: 50px;
      border-top: 1px solid gray;
      width: 100%;
    }

    .menu a {
      margin: 25px 0 0 0px;
      width: 100%;
    }

    .menu :global(.search) {
      display: none;
    }
  }

</style>

<div class="flex justify-between items-center menu relative">
  <Search suggest={false} />
  <a sveltekit:prefetch href="/market"><button
      on:click={toggle}>Market</button></a>
  <a sveltekit:prefetch href="/activity"><button
      on:click={toggle}>Activity</button></a>
  <!--
  <a href="/galleries"><button on:click={toggle}>Galleries</button></a>
  -->
  <a href={branding.urls.external.blog}><button
      on:click={toggle}>Blog</button></a>
  <a href="/faq"><button on:click={toggle}>FAQ</button></a>
  {#if $user}
    {#if $user.is_admin}
      <a href="/admin"><button on:click={toggle}>Admin</button></a>
    {/if}
    <a href={`/u/${$user.username}`}>
      <button on:click={toggle} class="flex">
        <Avatar user={$user} />
      </button></a>
  {:else}<a href="/login"><button on:click={toggle}>Sign In</button></a>{/if}
</div>
