<script context="module">
  import { serverApi } from "$lib/api";
  import { browser } from "$app/env";
  import { post } from "$lib/api";
  import branding from "$lib/branding";

  export async function load({ fetch, page }) {
    const props = await fetch(`/artworks/${page.params.slug}.json`).then((r) =>
      r.json()
    );

    let { artwork } = props;

    if (!artwork)
      return {
        status: 404,
      };

    if (!browser)
      post("/artworks/viewed", { id: artwork.id }, fetch)
        .res()
        .catch(console.log);

    artwork.views++;
    props.views = artwork.views;

    let metadata = { ...branding.meta };
    metadata.title = metadata.title + " - " + artwork.title;
    metadata.keywords =
      metadata.keywords + " " + artwork.tags.map((t) => t.tag).join(" ");
    metadata.description = artwork.description;

    if (artwork.filetype.includes("video"))
      metadata.video = "/api/ipfs/" + artwork.filename;
    else metadata.image = "/api/ipfs/" + artwork.filename;

    props.metadata = metadata;

    return {
      maxage: 90,
      props,
    };
  }

</script>

<script>
  import Fa from "svelte-fa";
  import {
    faChevronDown,
    faChevronUp,
    faGift,
    faShareAlt,
    faTimes,
  } from "@fortawesome/free-solid-svg-icons";
  import { getArtworkBySlug } from "$queries/artworks";
  import { faHeart, faImage } from "@fortawesome/free-regular-svg-icons";
  import { page } from "$app/stores";
  import { compareAsc, format, parseISO } from "date-fns";
  import {
    Activity,
    Avatar,
    Head,
    Heart,
    ArtworkMedia,
    ProgressLinear,
    RoyaltyInfo,
  } from "$comp";
  import Sidebar from "./_sidebar.svelte";
	import Comments from "./_comments.svelte";
  import { tick, onDestroy } from "svelte";
  import { art, meta, prompt, password, user, token, psbt } from "$lib/store";
  import countdown from "$lib/countdown";
  import { goto, err, explorer, info, linkify, units } from "$lib/utils";
  import { requirePassword } from "$lib/auth";
  import {
    createOffer,
    executeSwap,
    requestSignature,
    sign,
    broadcast,
  } from "$lib/wallet";
  import { Psbt } from "liquidjs-lib";
  import { api, query } from "$lib/api";
  import { SocialShare } from "$comp";
  import Button from "$styleguide/components/Button.svelte";
  import Card from "$styleguide/components/Card.svelte";

  export let artwork, metadata;

  $: disabled = loading ||
    !artwork ||
    artwork.transactions.some(
      (t) => ["purchase", "creation", "cancel"].includes(t.type) && !t.confirmed
    );

  let stopBidding = async () => {
    bidding = false;
  };

  function inDevelopment() {
    alert("This feature is in development");
  }

  let start_counter, end_counter, now, timeout;

  let id = artwork ? artwork.id : $page.params.id;

  let fetch = async () => {
    console.log("ARTWORK", artwork);
    query(getArtworkBySlug, { slug: artwork.slug }).then((res) => {
      artwork = res.artworks[0]

      $art = artwork;
    });
  };

  let actionClassName = null;
  //  let poll = setInterval(fetch, 2500);

  /* onDestroy(() => { */
  /*   $art = undefined; */
  /*   clearInterval(poll); */
  /* }); */

  $: update(artwork);
  let update = () => {
    if (!artwork) return;
    $art = artwork;

    let count = () => {
      clearTimeout(timeout);
      now = new Date();
      if (!artwork) return;
      start_counter = countdown(parseISO(artwork.auction_start)) || "";
      end_counter = countdown(parseISO(artwork.auction_end)) || "";
      timeout = setTimeout(count, 1000);
    };
    count();

    [sats, val, ticker] = units(artwork && artwork.asking_asset);
    list_price = artwork.list_price;
    list_price = val(artwork.list_price);
  };

  let list_price;
  let val, sats, ticker;
  let amount;

  let transaction = {};
  let makeOffer = async (e) => {
    try {
      if (e) e.preventDefault();
      offering = true;

      transaction.amount = sats(amount);
      transaction.asset = artwork.asset;
      transaction.type = "bid";

      await requirePassword();

      $psbt = await createOffer(artwork, transaction.amount);
      $psbt = await sign();

      transaction.psbt = $psbt.toBase64();
      transaction.hash = $psbt.data.globalMap.unsignedTx.tx.getId();

      await save();
      await fetch();

      offering = false;
    } catch (e) {
      console.log(e);
      err(e);
      offering = false;
    }
  };

  let save = async (e) => {
    transaction.artwork_id = artwork.id;
    transaction.asset = artwork.asking_asset;

    let { data, errors } = await api
      .auth(`Bearer ${$token}`)
      .url("/transaction")
      .post({ transaction })
      .json();

    if (errors) throw new Error(errors[0].message);

    if (transaction.type === "purchase") info("Sold! Congratulations!");
    if (transaction.type === "bid") info("Bid placed!");
    bidding = false;
  };

  let bidding, amountInput, offering;
  let startBidding = async () => {
    bidding = true;
    await tick();
    amountInput.focus();
  };

  let loading;
  let buyNow = async () => {
    try {
      await requirePassword();
      loading = true;

      transaction.amount = -artwork.list_price;
      transaction.asset = artwork.asset;
      transaction.type = "purchase";

      $psbt = await executeSwap(artwork);
      $psbt = await sign();

      if (artwork.has_royalty || artwork.auction_end) {
        $psbt = await requestSignature($psbt);
      }

      await broadcast($psbt);

      let tx = $psbt.extractTransaction();
      transaction.hash = tx.getId();
      transaction.psbt = $psbt.toBase64();

      await save();
      await fetch();
    } catch (e) {
      err(e);
    }

    loading = false;
  };

  let showPopup = false;
  let showMore = false;
  let showActivity = false;

</script>

<style lang="scss">
  .disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }

  .nft-container {
    max-width: 1120px;
  }

  .place-bid-button-bg {
    background: rgb(254, 96, 0);
    background: linear-gradient(
      225deg,
      rgba(254, 96, 0, 1) 0%,
      rgba(254, 1, 42, 1) 100%
    );
  }

  .buy-now-button-bg {
    background: rgb(191, 1, 191);
    background: linear-gradient(
      225deg,
      rgba(191, 1, 191, 1) 0%,
      rgba(13, 101, 191, 1) 100%
    );
  }

  .font-title {
    font-family: "Zen Dots", cursive;
    font-size: 2em;
    line-height: 1.25em;
  }

  .nft-box-shadow {
    box-shadow: 6px 6px 6px 0 rgba(0, 0, 0, 0.3);
  }
  .listContainer {
    overflow: hidden;
  }

  :global(.description a) {
    color: #3ba5ac;
  }

  .showPopup {
    display: flex !important;
    align-items: center;
    justify-content: center;
    animation: zoom 0.2s ease forwards;
  }

  .closeButton {
    position: absolute;
    top: 50px;
    right: 50px;
    width: 40px;
    height: 40px;
    border-radius: 100%;
    background: whitesmoke;
    padding: 11px 15px;
    cursor: pointer;
  }

  .mob-desc {
    display: none;
  }

  .mobileImage {
    display: none;
    margin-bottom: 40px;
  }

  .mobileImage :global(.cover) {
    width: 100%;
  }

  .popup :global(video) {
    width: 50%;
    height: auto !important;
    margin: 0 auto;
  }

  .popup :global(div) {
    width: 100%;
    height: auto;
  }

  .popup :global(.card-link) {
    height: auto !important;
  }

  .popup :global(img) {
    margin: 0 auto;
    height: 95vh;
    object-fit: contain !important;
  }

  .desktopImage :global(img),
  .desktopImage :global(video) {
    margin: 0 auto;
  }

  @keyframes zoom {
    0% {
      transform: scale(0.6);
    }
    100% {
      transform: scale(1);
    }
  }

  @media only screen and (max-width: 1023px) {
    .desc-text {
      height: 150px;
      overflow: hidden;
    }

    .openDesc {
      height: auto !important;
      overflow: visible;
    }

    .show-more {
      color: #3ba5ac;
      font-weight: bold;
      text-align: right;
      margin-top: 10px;
      cursor: pointer;
      white-space: normal;
    }

    .desktopImage,
    .desk-desc {
      display: none;
    }

    .mobileImage,
    .mob-desc {
      display: block;
    }

    .closeButton {
      top: 20px;
      right: 20px;
    }
  }

  @media only screen and (max-width: 500px) {
    .popup :global(img),
    .popup :global(video) {
      height: auto;
      width: 100%;
    }
  }

</style>

<Head {metadata} />

<div
  class="w-full h-96 bg-center bg-cover"
  style="background-image: url('https://blogs.esa.int/space19plus/files/2019/03/nebula.jpg');" />

<div class="nft-container mx-auto pt-24 mb-10">
  <div class="flex">
    <div class="w-1/3 mr-16">
      <div class="overflow-hidden rounded-2xl nft-box-shadow">
        <ArtworkMedia {artwork} />
      </div>
      {#if $user && $user.id === artwork.owner_id}
        <div class="mt-8">
          <a href={`/a/${artwork.slug}/edit`}>
            <Button primary class="w-full">Edit</Button>
          </a>
        </div>
      {/if}
      <div class="mt-12">
        <div class="text-2xl font-bold">History</div>
        <div class="mt-4 text-sm">
          {#each artwork.transactions.slice(0, showActivity ? artwork.transactions.length : 3) as transaction}
            <Activity {transaction} />
          {/each}
          {#if artwork.transactions.length > 3}
            <div
              class="flex text-xs cursor-pointer"
              on:click={() => (showActivity = !showActivity)}>
              <div>View {showActivity ? 'less' : 'more'}</div>
              <div class="my-auto ml-1">
                <Fa icon={showActivity ? faChevronUp : faChevronDown} />
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
    <div class="w-3/4 ml-16">
      <!-- Artwork title -->
      <div class="font-title">{artwork.title || 'Untitled'}</div>
      <!-- Creator/Owner & controls (like,share,gift)-->
      <div class="mt-16">
        <div class="flex">
          <!-- Avatar -->
          <div>
            <a
              href={`/${artwork.artist.username}`}
              class="text-gray-800 flex">
              <div>
                <Avatar user={artwork.artist} />
              </div>
              <div>
                <div class="ml-2 h-full flex flex-col justify-center">
                  <div class="text-sm text-black font-bold">Creator</div>
                  <div class="text-sm text-gray-800">
                    @{artwork.artist.username}
                  </div>
                </div>
              </div>
            </a>
          </div>
          <!-- Avatar -->
          <div class="ml-24">
            <a href={`/${artwork.owner.username}`} class="text-gray-800 flex">
              <div>
                <Avatar user={artwork.owner} />
              </div>
              <div>
                <div class="ml-2 h-full flex flex-col justify-center">
                  <div class="text-sm text-black font-bold">Owner</div>
                  <div class="text-sm text-gray-800">
                    @{artwork.owner.username}
                  </div>
                </div>
              </div>
            </a>
          </div>
          <div class="flex flex-1 justify-end items-center">
            <div
              class="mr-1 ml-1 bg-black w-8 h-8 rounded-full flex items-center justify-center text-white cursor-pointer"
              on:click={inDevelopment}>
              <Fa icon={faGift} />
            </div>
            <div
              class="mr-1 ml-1 bg-black w-8 h-8 rounded-full flex items-center justify-center text-white cursor-pointer"
              on:click={inDevelopment}>
              <Fa icon={faShareAlt} />
            </div>
            <div
              class="ml-1 bg-black w-8 h-8 rounded-full flex items-center justify-center text-white cursor-pointer">
              <Heart {artwork} size="1x" />
            </div>
          </div>
        </div>
        <hr class="mt-8 mb-8" />
        <!-- price & purchase/make bid -->
        <div class="flex">
          <!-- Price block-->

          {#if artwork.list_price || artwork.reserve_price}
            <div class="mr-8">
              <div
                class="flex flex-col justify-center align-center bg-black rounded-2xl px-8 h-32">
                {#if artwork.list_price}
                  <div class="text-white text-sm mb-4 font-medium">
                    Sell price
                  </div>
                  <div class="text-white text-3xl font-bold flex">
                    <div>{list_price}{ticker}</div>
                    <div class="text-gray-500 ml-8">4345.04$</div>
                  </div>
                {/if}

                {#if artwork.reserve_price}
                  <div class="text-white text-sm mb-4 font-medium">
                    Reserve price
                  </div>
                  <div class="text-white text-3xl font-bold flex">
                    <div>{val(artwork.reserve_price)} {ticker}</div>
                    <div class="text-gray-500 ml-8">4345.04$</div>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Controls -->
          <div class="flex flex-1 flex-col">
            <!-- @todo check button's look-->
            {#if artwork.list_price && !bidding && !offering}
              <input
                class={`flex justify-center mb-4 items-center inline-block rounded-2xl h-14 text-white font-medium text-center cursor-pointer text-lg ${actionClassName}`}
                type="button"
                on:click={buyNow}
                value="Buy now"
                {disabled}
                class:disabled />
            {/if}

            {#if bidding}
              {#if offering}
                <ProgressLinear />
              {:else}
                <form on:submit={makeOffer}>
                  <div class="flex flex-col mb-4">
                    <div>
                      <div class="mt-1 relative rounded-md shadow-sm">
                        <input
                          id="price"
                          class="form-input block w-full pl-7"
                          placeholder={val(0)}
                          bind:value={amount}
                          bind:this={amountInput} />
                        <div
                          class="absolute inset-y-0 right-0 flex items-center mr-2">
                          {ticker}
                        </div>
                      </div>
                    </div>
                  </div>
                  <input
                    class={`w-full flex justify-center items-center inline-block rounded-2xl h-14 text-white font-medium text-center cursor-pointer text-lg ${actionClassName}`}
                    type="submit"
                    value={artwork.list_price ? 'Make an offer' : 'Place bid'} />
                  <div
                    class="text-center text-sm cursor-pointer"
                    on:click={stopBidding}>
                    cancel
                  </div>
                </form>
              {/if}
            {:else if !artwork.auction_start || compareAsc(now, parseISO(artwork.auction_start)) === 1}
              <input
                class={`w-full flex justify-center items-center inline-block rounded-2xl h-14 text-white font-medium text-center cursor-pointer text-lg ${actionClassName}`}
                type="button"
                on:click={startBidding}
                value={artwork.list_price ? 'Make an offer' : 'Place bid'}
                {disabled}
                class:disabled />
            {/if}

            {#if compareAsc(parseISO(artwork.auction_start), now) === 1 && start_counter}
              <div
                class="flex flex-1 text-center flex justify-center items-center">
                <div class="text-sm">Auction starts in</div>
                <div class="ml-2">{start_counter}</div>
              </div>
            {:else if compareAsc(parseISO(artwork.auction_end), now) === 1 && end_counter}
              <div
                class="flex flex-1 text-center flex justify-center items-center">
                <div class="text-sm">Auction closes in</div>
                <div class="ml-2">{end_counter}</div>
              </div>
            {:else if artwork.auction_end}
              <div
                class="flex flex-1 text-center flex justify-center items-center">
                <div class="text-sm">Auction ended at</div>
                <div class="ml-2">
                  {format(parseISO(artwork.auction_end), 'yyyy-MM-dd HH:mm')}
                </div>
              </div>
            {/if}
          </div>
        </div>
        <!-- Description -->
        <div class="mt-12">
          <div class="text-2xl font-bold">Description</div>
          <div class="mt-4">
            {@html linkify(artwork.description) || 'Description of this product is empty'}
          </div>
        </div>

        <!-- Package content -->
        <div class="mt-12">
          <div class="text-2xl font-bold">Package content</div>
          <div class="mt-4">
            {artwork.package_content || 'Package content of this product is empty'}
          </div>
        </div>
				<Comments bind:artwork bind:fetch />
      </div>
    </div>
  </div>
  <div class="h-72" />
</div>
