<script>
  import { query } from "$lib/api";
  import { tick } from "svelte";
  import { asset, assets, balances, psbt, user, token } from "$lib/store";
  import { broadcast, pay, keypair, requestSignature } from "$lib/wallet";
  import { btc, dev, err, info, sats, val, assetLabel } from "$lib/utils";
  import sign from "$lib/sign";
  import { ProgressLinear } from "$comp";
  import { requirePassword } from "$lib/auth";
  import { getArtworkByAsset } from "$queries/artworks";
  import Button from "$styleguide/components/Button.svelte";

  export let withdrawing = false;

  let amount;
  let to = dev
    ? "AzppkpkTHBGfGcvU89AKH9JNuoe24LZvjbNCDStpykLLUj2S3n3zPFPVhQCiC8akswapzRrEqHnJUmMQ"
    : "";

  let loading;
  let artwork;

  $: updateAsset($asset);
  let updateAsset = (a) =>
    query(getArtworkByAsset(a))
      .then(({ artworks }) => (artwork = artworks[0]))
      .catch(err);

  $: clearForm($asset);
  let clearForm = () => {
    amount = undefined;
  };

  let send = async (e) => {
    await requirePassword();

    loading = true;
    try {
      if ($asset !== btc && !artwork) artwork = { asset: $asset };
      $psbt = await pay(artwork, to.trim(), sats($asset, amount));
      await sign(false);

      if (artwork && (artwork.auction_end || artwork.has_royalty)) {
        $psbt = await requestSignature($psbt);
      }

      await broadcast();

      info("Payment sent!");
      withdrawing = false;
    } catch (e) {
      console.log("BAD", e);
      err(e);
    }
    loading = false;
  };
</script>

{#if $user && withdrawing}
  <form
    class="border text-white bg-black md:rounded-lg p-5 w-full flex flex-col"
    on:submit|preventDefault={send}
    autocomplete="off"
  >
    <div class="flex justify-between place-items-center text-white">
      <p class="font-semibold">Withdraw Funds</p>
    </div>
    {#if loading}
      <ProgressLinear />
    {:else}
      <div class="flex flex-col mb-4">
        <label class="mt-4">Token</label>
        <div>
          <select
            class="appearance-none py-0 h-12 rounded-md w-full text-black"
            bind:value={$asset}
          >
            {#each $assets as asset}
              <option value={asset.asset}>{assetLabel(asset.asset)}</option>
            {/each}
          </select>
        </div>
        <div class="flex flex-col mb-4">
          <label for="amount" class="mt-4">Amount</label>

          <input
            id="amount"
            class="h-12 rounded-md w-full text-black"
            placeholder={val($asset, 0)}
            bind:value={amount}
          />
        </div>
        <div class="flex flex-col mb-4">
          <label for="address">Recipient Address</label>
          <textarea
            id="address"
            style="overflow:auto"
            placeholder="Address"
            bind:value={to}
            rows={4}
          />
        </div>
        <Button primary type="submit" class="hidden md:block w-full mt-5"
          >Complete withdraw</Button
        >
        <Button
          type="submit"
          class="border border-white rounded-lg font-bold block md:hidden w-full mt-5"
          >Complete withdraw</Button
        >
      </div>
    {/if}
  </form>
{/if}

<style>
  textarea,
  input,
  select {
    @apply rounded-lg p-2 text-black;
    margin-top: 10px;
  }
  .border {
    border: 1px solid grey;
  }
</style>
