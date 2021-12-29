<script>
  import Avatar from "$components/Avatar.svelte";
  import ArtworkMedia from "$components/ArtworkMedia.svelte";
  import Heart from "$styleguide/components/Heart.svelte";
  import countdown from "$lib/countdown";
  import { fade, goto, units, cad } from "$lib/utils";
  import Fa from "svelte-fa";
  import { faShareAlt } from "@fortawesome/free-solid-svg-icons";

  export let artwork;
  export let columns = 3;
  export let showDetails = true;
  export let loaded = false;
  export let thumb = true;
  export let popup = false;
  export let preview;

  let sats, val, ticker;
  $: if (artwork) [sats, val, ticker] = units(artwork.asking_asset);

  let width = "full";
  if (columns > 1) {
    width = "1/" + columns;
  }

  let start_counter, end_counter;
  let count = () => {
    if (!artwork) return;
    start_counter = countdown(new Date(artwork.auction_start));
    end_counter = countdown(new Date(artwork.auction_end));
    setTimeout(count, 1000);
  };
  count();

  function currencyConversion(amount, ticker, toString = true) {
    return "$0.00";

    const [getValue, getSats, cadTicker] = units(cad);

    // @TODO this is fake price conversion. Need to be replaced by coinos.io exchange rates api
    const price = val(amount) * 40000;

    if (toString) {
      return `${price} ${cadTicker}`;
    }

    return {
      value: price,
      ticker: cadTicker,
    };
  }

</script>

<style lang="scss">
  @import "../theme";

  .boxed {
    box-shadow: $card--box-shadow;
  }

  .description {
    color: $card--title--color;
    font-family: $card--title--font-family;
  }

  .username {
    color: $card--title--color;
  }

  .auction-item-background-gradient {
    background: $card--auction--static-background;
    background: $card--auction--gradient-background;
  }

  .buy-now-item-background-gradient {
    background: $card--buy-now--static-background;
    background: $card--buy-now--gradient-background;
  }

  .background-gray {
    background: $card--bottom-section--background;
  }

  .currency-arrow-font {
    font-family: $card--title--font-family;
    line-height: 1.6;
  }

  .title-font {
    font-family: $card--title--font-family;
  }

</style>

<div class="rounded-3xl overflow-hidden boxed" in:fade>
  <div class="h-60 overflow-hidden flex justify-center items-center">
    <a href={`/a/${artwork.slug}`} class="w-full">
      <ArtworkMedia {artwork} {showDetails} {popup} bind:loaded bind:thumb {preview} />
    </a>
  </div>
  {#if showDetails}
    <div class="bg-black h-30 px-6 pt-2">
      <div class="mb-1 border rounded-full w-12 border-solid border-white">
        <Avatar user={artwork.artist} />
      </div>
      <div class="text-xs mb-1 font-bold username">
        @{artwork.owner.username}
      </div>
      <div class="text-base pb-1 font-bold title-font description">
        {artwork.title || 'No Name'}
      </div>
    </div>
    {#if artwork.reserve_price}
      <div
        class="auction-item-background-gradient h-20 p-4 flex justify-between">
        <div class="flex-1 mr-2">
          <div class="text-xs">Reserve Price</div>
          <div class="text-sm flex justify-start font-bold">
            <div>{val(artwork.reserve_price)} {ticker}</div>
            <div class="ml-2 currency-arrow-font">&#62;</div>
            <div class="ml-2">{currencyConversion(artwork.reserve_price)}</div>
          </div>
        </div>
        {#if artwork.bid && artwork.bid.user}
          <div class="ml-2">
            <div class="text-xs whitespace-nowrap">
              Current bid by @{artwork.bid.user.username}
            </div>
            <div class="text-sm flex justify-start font-bold">
              <div>{val(artwork.bid.amount)} {ticker}</div>
              <div class="ml-2 currency-arrow-font">&#62;</div>
              <div class="ml-2">{currencyConversion(artwork.bid.amount)}</div>
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div
        class="buy-now-item-background-gradient h-20 p-4 px-6 flex justify-between">
        <div class="flex-1 mr-4">
          <div class="text-xs">Buy now</div>
          <div class="text-base flex justify-start font-bold">
            {#if artwork.list_price}
              <div>{val(artwork.list_price)} {ticker}</div>
            {/if}
            <div class="ml-2 currency-arrow-font">&#62;</div>
            <div class="ml-2">
              {currencyConversion(artwork.list_price, ticker)}
            </div>
          </div>
        </div>
      </div>
    {/if}
    <div class="background-gray h-20 p-4 px-6 flex justify-between">
      {#if artwork.auction_end}
      <div>
        {#if end_counter}
          <div class="text-xs">Time left:</div>
          <div class="font-bold text-lg">{end_counter}</div>
        {/if}
      </div>
    {/if}

      <div class="ml-auto flex items-center justify-center">
        <Heart {artwork} />
        <span on:click={() => alert('in development')}>
          <Fa
            icon={faShareAlt}
            class="ml-4 cursor-pointer"
            color="#000"
            size="lg" />
        </span>
      </div>
    </div>
  {/if}
</div>
