<script>
  import { onDestroy } from "svelte";
  import Fa from "svelte-fa";
  import { faUser, faCopy } from "@fortawesome/free-solid-svg-icons";
  import { hasura } from "$lib/api";
  import { getArtworksByOwner } from "$queries/artworks";
  import {
    asset,
    balances,
    pending as pendingBalances,
    rate,
    user,
    token,
  } from "$lib/store";
  import { assetLabel, btc, val, copy } from "$lib/utils";
  import { getBalances } from "$lib/wallet";
  import { requireLogin } from "$lib/auth";
  import { page } from "$app/stores";
  export let styles =
    "wallet z-10 absolute left-1/2 bg-white shadow-md w-80 -ml-20 mt-16 rounded-xl overflow-hidden";

  if (!$asset) $asset = btc;

  let balance, loading, pending;
  balances.subscribe((b) => b && (balance = val($asset, b[$asset] || 0)));
  pendingBalances.subscribe(
    (p) => p && (pending = val($asset, p[$asset] || 0))
  );

  let artworks = [];
  $: init($user);

  let init = async (u) => {
    if (!u) return;
    let { data } = await hasura
      .auth(`Bearer ${$token}`)
      .post({
        query: getArtworksByOwner($user.id),
      })
      .json();

    if (data) ({ artworks } = data);
    getBalances();
    loading = false;
  };

  let interval = setInterval(getBalances, 2000);
  onDestroy(() => clearInterval(interval));
</script>

{#if $user}
  <div class={styles}>
    <div
      class="rounded-t-lg background h-12 p-4 flex items-center justify-between"
    >
      <div class="flex items-center text-white">
        <a href="/wallet" class="flex items-center text-white" on:click>
          <Fa icon={faUser} class="mr-4" /> @{$user.username}
        </a>
      </div>
      <div
        class="flex items-center text-white cursor-pointer"
        on:click={() => copy($user.address)}
      >
        <div class="mr-4" on:click>
          {$user.address.substr(0, 3)}...{$user.address.substr(-3)}
        </div>
        <div
          on:click={() => {
            navigator.clipboard.writeText($user.address);
          }}
        >
          <div>
            <Fa icon={faCopy} class="cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
    <div class="p-4 text-black">
      <div class="border border-gray-300 rounded-lg">
        <div class="text-center font-semibold text-gray-500 text-xs p-2">
          Balance
        </div>
        <div class="flex font-bold text-lg border-t">
          <div class="flex-1 text-center p-2 border-r">
            <div>
              {parseFloat(balance).toFixed(4)}
              {assetLabel($asset)}
            </div>
            {#if pending}
              <div class="text-orange-300 text-xs">
                + {parseFloat(pending).toFixed(4)} pending
              </div>
            {/if}
          </div>
          <div class="flex-1 text-center p-2 ">
            <div>
              US ${(balance * $rate).toFixed(2)}
            </div>
            {#if pending}
              <div class="text-orange-300 text-xs">
                + ${parseFloat(pending * $rate).toFixed(4)}
              </div>
            {/if}
          </div>
        </div>
      </div>
      <div class="text-black flex items-center mt-2">
        <div class="flex-1 mr-2">
          <a href="/wallet/fund">
            <button
              class="w-full text-sm border border-gray-300 text-white font-bold rounded-lg bg-gray-300 py-3"
              on:click
            >
              Fund
            </button>
          </a>
        </div>
        <div class="flex-1 ml-2">
          <a href="/wallet/withdraw">
            <button
              class="w-full text-sm border border-gray-300 text-white font-bold rounded-lg bg-gray-300 py-3"
              on:click
            >
              Withdraw
            </button>
          </a>
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .background {
    background: linear-gradient(
      90deg,
      #fa7900 0%,
      #df36b4 43%,
      #0063ea 77%,
      #00eaaf 100%
    );
  }

  @import "../theme";
  .wallet {
    font-family: $font-family;
  }
</style>
