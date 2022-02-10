<script>
  import Avatar from "$components/Avatar.svelte";
  import ArtworkMedia from "$components/ArtworkMedia.svelte";
  import Heart from "$styleguide/components/Heart.svelte";
  import countdown from "$lib/countdown";
  import { fade, goto, units, cad, info } from "$lib/utils";
  import Fa from "svelte-fa";
  import { faShareAlt } from "@fortawesome/free-solid-svg-icons";
  import { rate } from "$lib/store";

  export let artwork;
  export let columns = 3;
  export let showDetails = true;
  export let thumb = true;
  export let popup = false;
  export let preview = undefined;

  export let summary = false;
  export let usernameOnly = false;
  export let artworkButton = false;
  export let titleOnly = false;
  export let textSize0 = "text-xs";
  export let textSize1 = "text-sm";
  export let height = "h-20";

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

  let currencyConversion = (amount, ticker) =>
    `$${(val(amount) * $rate).toFixed(0)} USD`;

  let updateTitle = () => {
    if (artwork.title) {
      if (artwork.title.length > 30) {
        return `${artwork.title.substr(0, 30)}...`;
      } else {
        return artwork.title;
      }
    } else {
      return "No Name";
    }
  };

  $: title = updateTitle(artwork.title);
</script>

{#if titleOnly}
  {artwork.title}
{/if}
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
    class="w-full lg:w-3/5 mb-6 md:mb-0 mx-auto backgroundGradientPurple p-2 rounded-xl text-white font-bold m-2"
    >Explore experience</button
  >
{/if}

<div class="slide rounded-3xl overflow-hidden boxed" in:fade>
  {#if !summary}
    <a href={`/a/${artwork.slug}`} class="w-full">
      <div class="h-72 overflow-hidden flex justify-center items-center">
        <ArtworkMedia {artwork} {showDetails} {popup} bind:thumb {preview} />
      </div></a
    >
  {/if}
  {#if showDetails}
    {#if !summary}
      <div class="bg-black flex h-32 px-6 pt-4">
        <a href={`/a/${artwork.slug}`} class="w-full">
          <div class="relative pt-8">
            <div class="mb-1 absolute -top-12 z rounded-full w-16">
              <Avatar user={artwork.artist} size="lg" />
            </div>
            <div class="text-xs mb-1 italic font-bold text-gray-300">
              @{artwork.artist.username}
            </div>
            <div class="text-base pb-1 title-font description">
              {title}
            </div>
          </div></a
        >
        <div class="ml-auto mb-auto flex items-center justify-center">
          <span
            on:click={() => {
              navigator.clipboard.writeText(
                `https://cozmos.io/a/${artwork.slug}`
              );
              info("Link to NFT copied to clipboard!");
            }}
          >
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
      <a href={`/a/${artwork.slug}`} class="w-full">
        <div
          class="auction-item-background-gradient {height} p-4 flex justify-between"
          class:summary
        >
          <div class="flex-1 mr-2">
            <div class={textSize0} class:text-gray-300={summary}>
              Reserve Price
            </div>
            <div class="{textSize1} font-bold">
              <div class:text-white={summary}>
                {val(artwork.reserve_price)}
                {ticker}
              </div>

              <div class:text-gray-300={summary}>
                {currencyConversion(artwork.reserve_price)}
              </div>
            </div>
          </div>
          {#if artwork.bid && artwork.bid.user}
            <div class="ml-2" class:text-secondary={summary}>
              <div class="{textSize0} whitespace-nowrap">
                Current bid by @{artwork.bid.user.username}
              </div>
              <div class="{textSize1} flex justify-start font-bold">
                <div>{val(artwork.bid.amount)} {ticker}</div>
                <div class="ml-2 currency-arrow-font">&#62;</div>
                <div class="ml-2">{currencyConversion(artwork.bid.amount)}</div>
              </div>
            </div>
          {/if}
        </div></a
      >
    {:else}
      <a href={`/a/${artwork.slug}`} class="w-full">
        <div
          class="bg-gradient-to-r from-cyan-300 via-purple-500 to-pink-600 {height} p-4 px-6 flex justify-between"
          class:summary
        >
          <div class="flex-1 mr-4">
            <div class={textSize0} class:text-gray-300={summary}>Buy now</div>
            <div class="{textSize1} text-base font-bold">
              {#if artwork.list_price}
                <div class={textSize1} class:text-white={summary}>
                  {val(artwork.list_price)}
                  {ticker}
                </div>
              {/if}

              <div class={textSize1} class:text-gray-300={summary}>
                {#if artwork.list_price}
                  {currencyConversion(artwork.list_price, ticker)}
                {:else}
                  Price not set
                {/if}
              </div>
            </div>
          </div>

          {#if artwork.auction_end}
            <div class:text-secondary={summary}>
              {#if end_counter}
                <div class={textSize0}>Time left:</div>
                <div class="font-bold text-lg">{end_counter}</div>
              {/if}
            </div>
          {/if}
        </div></a
      >
    {/if}
  {/if}
</div>

<style lang="scss">
  @keyframes slide {
    100% {
      box-shadow: 3px 3px 3px rgba(204, 204, 204, 0.25);
      transform: translateY(-2.5%);
    }
  }

  .slide {
    animation-duration: 0.25s;

    animation-fill-mode: both;

    animation-timing-function: ease-in-out;
  }
  .slide:hover {
    animation-name: slide;
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
    z-index: 1;
  }

  .summary {
    background: rgba(0, 0, 0, 0.5);
  }
  .backgroundGradientPurple {
    background-image: linear-gradient(45deg, blue, purple, deeppink);
  }
</style>
