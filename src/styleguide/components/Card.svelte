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
  export let thumb = true;
  export let popup = false;
  export let preview = undefined;

  export let summary = false;
  export let usernameOnly = false;
  export let artworkButton = false;

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

{#if usernameOnly}
  @{artwork.artist.username}
{/if}
{#if artworkButton}
  <button
    on:click={() => {
      goto(`/a/${artwork.slug}`);
    }}
    type="button"
    name="button"
    class="w-full md:w-3/5 mb-6 md:mb-0 mx-auto backgroundGradientPurple p-2 rounded-xl text-white font-bold m-2"
    >Explore experience</button
  >
{/if}
<a href={`/a/${artwork.slug}`} class="w-full">
  <div class="bounce rounded-3xl overflow-hidden boxed" in:fade>
    {#if !summary}
      <div class="h-60 overflow-hidden flex justify-center items-center">
        <ArtworkMedia {artwork} {showDetails} {popup} bind:thumb {preview} />
      </div>
    {/if}
    {#if showDetails}
      {#if !summary}
        <div class="bg-black flex h-32 px-6 pt-4">
          <div class="relative pt-8">
            <div class="mb-1 absolute -top-12 z rounded-full w-16">
              <Avatar user={artwork.artist} size="lg" />
            </div>
            <div class="text-xs mb-1 italic font-bold text-gray-300">
              @{artwork.artist.username}
            </div>
            <div class="text-base pb-1 font-bold title-font description">
              {artwork.title || "No Name"}
            </div>
          </div>
          <div class="ml-auto mb-auto flex items-center justify-center">
            <Heart {artwork} size="sm" />
            <span on:click={() => alert("in development")}>
              <Fa
                icon={faShareAlt}
                class="ml-4 cursor-pointer"
                color="#fff"
                size="sm"
              />
            </span>
          </div>
        </div>
      {/if}
      {#if artwork.reserve_price}
        <div
          class="auction-item-background-gradient h-20 p-4 flex justify-between"
          class:summary
        >
          <div class="flex-1 mr-2">
            <div class="text-xs" class:text-gray-300={summary}>
              Reserve Price
            </div>
            <div class="text-sm flex justify-start font-bold">
              <div class:text-white={summary}>
                {val(artwork.reserve_price)}
                {ticker}
              </div>
              <div class="ml-2 currency-arrow-font" class:text-white={summary}>
                &#62;
              </div>
              <div class="ml-2" class:text-gray-300={summary}>
                {currencyConversion(artwork.reserve_price)}
              </div>
            </div>
          </div>
          {#if artwork.bid && artwork.bid.user}
            <div class="ml-2" class:text-secondary={summary}>
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
          class="bg-gradient-to-r from-cyan-300 via-purple-500 to-pink-600 h-20 p-4 px-6 flex justify-between"
          class:summary
        >
          <div class="flex-1 mr-4">
            <div class="text-xs" class:text-gray-300={summary}>Buy now</div>
            <div class="text-base flex justify-start font-bold">
              {#if artwork.list_price}
                <div class:text-white={summary}>
                  {val(artwork.list_price)}
                  {ticker}
                </div>
              {/if}
              <div class="ml-2 currency-arrow-font" class:text-white={summary}>
                &#62;
              </div>
              <div class="ml-2" class:text-gray-300={summary}>
                {currencyConversion(artwork.list_price, ticker)}
              </div>
            </div>
          </div>

          {#if artwork.auction_end}
            <div class:text-secondary={summary}>
              {#if end_counter}
                <div class="text-xs">Time left:</div>
                <div class="font-bold text-lg">{end_counter}</div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</a>

<style lang="scss">
  @keyframes bounce {
    0%,
    100%,
    20%,
    50%,
    80% {
      -webkit-transform: translateY(0);
      -ms-transform: translateY(0);
      transform: translateY(0);
    }
    40% {
      -webkit-transform: translateY(-30px);
      -ms-transform: translateY(-30px);
      transform: translateY(-30px);
    }
    60% {
      -webkit-transform: translateY(-15px);
      -ms-transform: translateY(-15px);
      transform: translateY(-15px);
    }
  }

  .bounce {
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-timing-function: ease-in-out;
    animation-timing-function: ease-in-out;
  }
  .bounce:hover {
    animation-name: bounce;
    -moz-animation-name: bounce;
  }
  @import "../theme";

  .boxed {
    box-shadow: $card--box-shadow;
  }

  .description {
    color: $card--title--color;
    font-family: $card--title--font-family;
  }

  .auction-item-background-gradient {
    background: $card--auction--static-background;
    background: $card--auction--gradient-background;
  }

  .currency-arrow-font {
    font-family: $card--title--font-family;
    line-height: 1.6;
  }

  .title-font {
    font-family: $card--title--font-family;
  }

  .z {
    z-index: 1000;
  }

  .summary {
    background: rgba(0, 0, 0, 0.5);
  }
  .backgroundGradientPurple {
    background-image: linear-gradient(45deg, blue, purple, deeppink);
  }
</style>
