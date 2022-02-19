<script>
  import Fa from "svelte-fa";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import { goto } from "$lib/utils";
  import { page } from "$app/stores";
  import { asset, assets, balances, user } from "$lib/store";
  import { ProgressLinear } from "$comp";
  import { requireLogin } from "$lib/auth";
  import { getBalances } from "$lib/wallet";
  import { btc, cad, usd, val } from "$lib/utils";
  import { border, bg, outer } from "./_colors";

  $: if ($user) getBalances();
</script>

{#if $balances}
  <div class="container mx-auto">
    <div class="mb-5">
      <a href="/wallet" class="text-black md:text-white">
        <div class="flex">
          <Fa icon={faChevronLeft} class="my-auto mr-1" />
          <div>Back</div>
        </div>
      </a>
    </div>
    <div class="border border-white bg-black p-4 rounded-lg">
      {#each $assets as a}
        <div
          class="flex mb-2 cursor-pointer"
          on:click={() => {
            $asset = a.asset;
            goto("/wallet");
          }}
        >
          <div class={`py-2 ${outer(a.asset)} w-3 rounded-l-lg`} />
          <div
            class={`flex ${bg(
              a.asset
            )} text-white rounded-r-lg p-4 flex-grow ${border(a.asset)}`}
            class:active={$asset === a.asset}
          >
            <div class="flex-grow">{a.name}</div>
            <div>{val(a.asset, $balances[a.asset] || 0)}</div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style lang="scss">
  @import "../../styleguide/theme";

  .bg-btc {
    background-color: $color-orange-80;
  }
  .outer-btc {
    background: $color-orange;
  }
  .border-btc {
    border-color: transparent;
  }

  .dark-red {
    background: #2b0208;
  }
  .dark-yellow {
    background: #31240c;
  }
  .dark-green {
    background: #082527;
  }
  .dark-gray {
    background-color: darkgray;
  }
  .border-blue {
    border-color: #ef4baf;
  }

  .active {
    @apply border-t-2 border-b-2 border-r-2 text-white;
  }

  .container {
    margin-top: 1rem;
  }
</style>
