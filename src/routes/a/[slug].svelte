<script context="module">
  import { serverApi } from "$lib/api";
  import { browser } from "$app/env";
  import { post } from "$lib/api";
  import branding from "$lib/branding";

  export async function load({ fetch, params: { slug } }) {
    const props = await fetch(`/artworks/${slug}.json`).then((r) => r.json());

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

    if (artwork?.main?.length && artwork.main[0].filetype.includes("video"))
      metadata.video = "/api/ipfs/" + artwork.main[0]?.hash;
    else metadata.image = "/api/ipfs/" + artwork.main[0]?.hash;

    props.metadata = metadata;

    return {
      props,
    };
  }
</script>

<script>
  import Fa from "svelte-fa";
  import {
    faChevronDown,
    faChevronUp,
    faChevronRight,
    faShareAlt,
    faTimes,
    faPlay,
  } from "@fortawesome/free-solid-svg-icons";
  import { getArtworkBySlug } from "$queries/artworks";
  import { faHeart, faImage } from "@fortawesome/free-regular-svg-icons";
  import { page } from "$app/stores";
  import { compareAsc, format, parseISO } from "date-fns";
  import {
    Activity,
    Avatar,
    Congrats,
    Head,
    Heart,
    ArtworkMedia,
    PhotoGallery,
    ProgressLinear,
    RoyaltyInfo,
    ConfirmRedeem,
    ConfirmDelete,
  } from "$comp";
  import Sidebar from "./_sidebar.svelte";
  import Comments from "./_comments.svelte";
  import { tick, onDestroy } from "svelte";
  import {
    art,
    meta,
    rate,
    prompt,
    password,
    user,
    token,
    psbt,
  } from "$lib/store";
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
  import Button from "$styleguide/components/Button.svelte";
  import Card from "$styleguide/components/Card.svelte";

  export let artwork, metadata;

  $: disabled =
    loading ||
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
    query(getArtworkBySlug, { slug: artwork.slug }).then((res) => {
      artwork = res.artworks[0];

      $art = artwork;
    });
  };

  let actionClassName = null;
  let poll = setInterval(fetch, 2500);

  onDestroy(() => {
    $art = undefined;
    clearInterval(poll);
  });

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
    list_price = val(
      artwork.list_price +
        Math.round(
          artwork.royalty_recipients.reduce(
            (a, b) => a + b.amount * artwork.list_price,
            0
          ) / 100
        )
    );
    reserve_price = val(artwork.reserve_price);
    if (!fiat) fiat = (list_price * $rate).toFixed(0);
    if (!reserveFiat) reserveFiat = (reserve_price * $rate).toFixed(0);
  };

  let list_price, reserve_price, fiat, reserveFiat, val, sats, ticker, amount;

  let showCongrats = () => {
    $prompt = {
      component: Congrats,
      hide: true,
      artwork,
    };
  };

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

      await api.url("/offer-notifications").auth(`Bearer ${$token}`).post({
        artworkId: artwork.id,
        transactionHash: transaction.hash,
      });

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

  let showConfirm = () => {
    $prompt = {
      component: ConfirmRedeem,
      hide: true,
      artwork,
    };
  };

  let showConfirmDelete = () => {
    $prompt = {
      component: ConfirmDelete,
      hide: true,
      artwork,
    };
  };

  let loading;
  let redeem = () => showConfirm();
  let del = () => showConfirmDelete();

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

      showCongrats();

      await api.url("/mail-purchase-successful").auth(`Bearer ${$token}`).post({
        userId: $user.id,
        artworkId: artwork.id,
      });

      await api.url("/mail-artwork-sold").auth(`Bearer ${$token}`).post({
        userId: artwork.owner.id,
        artworkId: artwork.id,
      });
    } catch (e) {
      err(e);
    }

    loading = false;
  };

  let showMore = false;
  let showActivity = false;

  let bannerVideo;

  function coverImage() {
    if (artwork.cover[0]) {
      return `/api/ipfs/${artwork.cover[0].hash}`;
    } else {
      return "https://blogs.esa.int/space19plus/files/2019/03/nebula.jpg";
    }
  }

  let showPopup = false;

  let historyToggle = "hidden";
</script>

<Head {metadata} />

<div
  class="w-full h-96 bg-center bg-cover flex justify-center items-center"
  style="background-image: url({coverImage()});"
>
  {#if artwork.video[0]}
    <button
      type="button"
      name="button"
      class="text-white"
      on:click={() => {
        showPopup = !showPopup;
        bannerVideo.play();
      }}
    >
      <img
        src="/svg_icons/playbutton.svg"
        alt="Play button"
        class="w-32 mx-auto"
      />
    </button>
    {#if showPopup}
      <div class:showPopup class="popup">
        <span class="closeButton" on:click={() => (showPopup = !showPopup)}
          ><Fa icon={faTimes} /></span
        >
        <video
          src={`/api/ipfs/${artwork.video[0].hash}`}
          preload
          autoplay
          controls
          loop
          disablepictureinpicture
          controlslist="nodownload"
          class="w-full"
          bind:this={bannerVideo}
        />
      </div>
    {/if}
  {/if}
</div>

<div class="nft-container mx-auto pt-4 md:pt-24 mb-10 px-4 md:px-0">
  <div class="md:flex">
    <div class="order-2 md:w-3/4 md:ml-16">
      <!-- Artwork title -->
      <div class="font-title text-center md:text-left">
        {artwork.title || "Untitled"}
      </div>
      <!-- Creator/Owner & controls (like,share,gift)-->
      <div class="mt-2 md:mt-16">
        <div class="md:flex">
          <div class="flex justify-between md:justify-start">
            <!-- Avatar -->
            <div class="flex justify-center md:block">
              <div>
                <a
                  href={`/${artwork.artist.username}`}
                  class="text-gray-800 flex"
                >
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
            </div>
            <!-- Avatar -->
            <div class="flex justify-center md:block">
              <div class="md:ml-24">
                <a
                  href={`/${artwork.owner.username}`}
                  class="text-gray-800 flex"
                >
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
            </div>
          </div>

          <div
            class="flex flex-1 justify-center md:justify-end items-center my-4 md:my-0"
          >
            <div
              class="mr-1 ml-1 bg-black w-8 h-8 rounded-full flex items-center justify-center text-white cursor-pointer"
              on:click={() => {
                navigator.clipboard.writeText(
                  `https://cozmos.io/a/${artwork.slug}`
                );
                info("Link to NFT copied to clipboard!");
              }}
            >
              <Fa icon={faShareAlt} />
            </div>
          </div>
        </div>

        <hr class="mt-8 mb-8" />
        <!-- price & purchase/make bid -->
        <div class="block md:flex">
          <!-- Price block-->
          {#if artwork.list_price || artwork.reserve_price}
            <div class="mr-0 md:mr-8">
              <div
                class="flex flex-col justify-center align-center bg-black rounded-2xl px-8 h-32"
              >
                {#if artwork.list_price}
                  <div class="text-white text-sm mb-4 font-medium">
                    Sell price
                  </div>
                  <div class="text-white text-3xl font-bold flex">
                    <div>{list_price}{ticker}</div>
                    <div class="text-gray-500 ml-8">${fiat}</div>
                  </div>
                {/if}

                {#if artwork.reserve_price}
                  <div class="text-white text-sm mb-4 font-medium">
                    Reserve price
                  </div>
                  <div class="text-white text-3xl font-bold flex">
                    <div>{val(artwork.reserve_price)} {ticker}</div>
                    <div class="text-gray-500 ml-8">${reserveFiat}</div>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Controls -->
          <div class="mt-4 md:mt-0 flex flex-1 flex-col">
            <!-- @todo check buttons look -->
            {#if artwork.list_price && !bidding && !offering && $user?.id !== artwork.owner_id}
              <input
                class={`flex justify-center mb-4 backgroundGradientPurple text-white items-center inline-block rounded-2xl h-14 font-bold text-center cursor-pointer text-lg ${actionClassName}`}
                type="button"
                on:click={buyNow}
                value="Buy now"
                {disabled}
                class:disabled
              />
            {/if}

            {#if bidding && $user?.id !== artwork.owner_id}
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
                          bind:this={amountInput}
                        />
                        <div
                          class="absolute inset-y-0 right-0 flex items-center mr-2"
                        >
                          {ticker}
                        </div>
                      </div>
                    </div>
                  </div>
                  <input
                    class={`w-full flex justify-center items-center inline-block rounded-2xl h-14 text-center cursor-pointer text-lg text-white font-bold ${actionClassName}`}
                    class:backgroundGradientPurple={!artwork.auction_start}
                    class:backgroundGradientRed={artwork.auction_start}
                    type="submit"
                    value={artwork.list_price ? "Make an offer" : "Place bid"}
                  />
                  <div
                    class="text-center text-sm cursor-pointer border border-black w-32 rounded-full mx-auto p-2 m-2"
                    on:click={stopBidding}
                  >
                    Cancel
                  </div>
                </form>
              {/if}
            {:else if (!artwork.auction_start && $user?.id !== artwork.owner_id) || (compareAsc(now, parseISO(artwork.auction_start)) === 1 && $user?.id !== artwork.owner_id)}
              <input
                class={`w-full flex justify-center items-center inline-block rounded-2xl h-14 text-center cursor-pointer text-lg text-white font-bold ${actionClassName}`}
                class:backgroundGradientPurple={!artwork.auction_start}
                class:backgroundGradientRed={artwork.auction_start}
                type="button"
                on:click={startBidding}
                value={artwork.list_price ? "Make an offer" : "Place bid"}
                {disabled}
                class:disabled
              />
            {/if}

            {#if compareAsc(parseISO(artwork.auction_start), now) === 1 && start_counter}
              <div
                class="flex justify-center items-center text-center rounded-2xl h-14 mt-2 backgroundGradientRed text-white font-bold"
              >
                <div>
                  <div class="text-sm">Auction starts in</div>
                  <div>{start_counter}</div>
                </div>
              </div>
            {:else if compareAsc(parseISO(artwork.auction_end), now) === 1 && end_counter}
              <div
                class="flex justify-center items-center text-center rounded-2xl h-14 mt-2 backgroundGradientRed text-white font-bold"
              >
                <div>
                  <div class="text-sm">Auction ending in</div>
                  <div>{end_counter}</div>
                </div>
              </div>
            {:else if artwork.auction_end}
              <div
                class="flex justify-center items-center text-center rounded-2xl h-14 mt-2 backgroundGradientRed text-white font-bold"
              >
                <div>
                  <div class="text-sm">Auction ended at</div>
                  <div>
                    {format(parseISO(artwork.auction_end), "yyyy-MM-dd HH:mm")}
                  </div>
                </div>
              </div>
            {/if}

            {#if $user && $user.id === artwork.artist_id}
              <a href={`/a/${artwork.slug}/edit`} class="block md:hidden">
                <Button class="w-full border border-black mt-4">Edit</Button>
              </a>
            {/if}
          </div>
        </div>

        <div class="block md:hidden mt-10 order-1 md:w-1/3 md:mr-16">
          <div
            class="cursor-pointer overflow-hidden rounded-2xl nft-box-shadow mb-8"
          >
            <ArtworkMedia {artwork} popupImage={true} />
          </div>

          {#if $user && $user.id === artwork.owner_id}
            <a href={`/a/${artwork.slug}/transfer`}>
              <Button class="my-2 mx-auto w-full border border-black" {disabled}
                >Transfer</Button
              >
            </a>
          {/if}

          {#if $user && $user.id === artwork.artist_id && !artwork.redeemed}
            <Button
              on:click={redeem}
              class="my-2 w-full mx-auto border border-black">Redeem</Button
            >
          {/if}
          {#if $user && $user.id === artwork.artist_id && $user.id === artwork.owner_id}
            <Button
              on:click={del}
              class="my-2 w-full mx-auto border border-black">Delete</Button
            >
          {/if}
        </div>

        <!-- Description -->
        <div class="mt-12">
          <div class="text-2xl font-bold">Description</div>
          <div class="mt-2">
            {@html linkify(artwork.description) ||
              "Description of this product is empty"}
          </div>
        </div>
        <!-- Package content -->
        <div class="mt-12">
          <div class="text-2xl font-bold">Package content</div>
          <div class="mt-2">
            {artwork.package_content ||
              "Package content of this product is empty"}
          </div>
        </div>

        <!-- Gallery photos -->
        {#if artwork.gallery[0]}
          <div class="mt-12">
            <div class="text-2xl font-bold">Gallery</div>
            <div class="mt-2">
              <PhotoGallery images={artwork.gallery} />
            </div>
          </div>
        {/if}

        <!-- History mobile -->
        <div class="block md:hidden mt-12 border border-gray rounded-xl p-4">
          <div
            class="text-2xl font-bold flex justify-between items-center"
            on:click={() => {
              if (historyToggle === "hidden") {
                historyToggle = "block";
              } else {
                historyToggle = "hidden";
              }
            }}
          >
            History <Fa
              icon={historyToggle === "block" ? faChevronDown : faChevronRight}
            />
          </div>
          <div class="mt-4 text-sm {historyToggle}">
            {#each artwork.transactions.slice(0, showActivity ? artwork.transactions.length : 3) as transaction}
              <Activity {transaction} />
            {/each}
            {#if artwork.transactions.length > 3}
              <div
                class="flex text-xs cursor-pointer"
                on:click={() => (showActivity = !showActivity)}
              >
                <div>View {showActivity ? "less" : "more"}</div>
                <div class="my-auto ml-1">
                  <Fa icon={showActivity ? faChevronUp : faChevronDown} />
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Comments -->
        <Comments bind:artwork bind:fetch />
      </div>
    </div>
    <div class="hidden md:block order-1 md:w-1/3 md:mr-16">
      <div
        class="cursor-pointer overflow-hidden rounded-2xl nft-box-shadow mb-8"
      >
        <ArtworkMedia {artwork} popupImage={true} thumb={false} />
      </div>
      <RoyaltyInfo {artwork} />
      {#if $user && $user.id === artwork.owner_id}
        <a href={`/a/${artwork.slug}/edit`}>
          <Button primary class="w-full mb-2">Edit</Button>
        </a>
      {/if}
      {#if $user && $user.id === artwork.owner_id}
        <a href={`/a/${artwork.slug}/transfer`}>
          <Button primary class="w-full mb-2" {disabled}>Transfer</Button>
        </a>
      {/if}
      {#if $user && $user.id === artwork.artist_id && !artwork.redeemed}
        <Button primary on:click={redeem} class="w-full mb-2">Redeem</Button>
      {/if}
      {#if $user && $user.id === artwork.artist_id && $user.id === artwork.owner_id}
        <Button on:click={del} primary class="w-full mb-2">Delete</Button>
      {/if}
      <div class="mt-12 border border-gray rounded-xl p-4">
        <div class="text-2xl font-bold">History</div>
        <div class="mt-4 text-sm">
          {#each artwork.transactions.slice(0, showActivity ? artwork.transactions.length : 3) as transaction}
            <Activity {transaction} />
          {/each}
          {#if artwork.transactions.length > 3}
            <div
              class="flex text-xs cursor-pointer"
              on:click={() => (showActivity = !showActivity)}
            >
              <div>View {showActivity ? "less" : "more"}</div>
              <div class="my-auto ml-1">
                <Fa icon={showActivity ? faChevronUp : faChevronDown} />
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .popup {
    position: fixed;
    z-index: 9000000000;
    width: 100%;
    height: 100vh;
    padding: 5px;
    text-align: center;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: white;
    scroll-behavior: contain;
    transform: scale(0);
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

  .popup :global(video) {
    width: 100%;
    height: 100vh !important;
    margin: 0 auto;
    z-index: -1;
  }

  .popup :global(div) {
    width: 100%;
    height: auto;
  }
  .popup :global(img) {
    margin: 0 auto;
    height: 95vh;
    object-fit: contain !important;
  }

  .backgroundGradientRed {
    background-image: linear-gradient(45deg, red, orange);
  }

  .backgroundGradientPurple {
    background-image: linear-gradient(45deg, blue, purple);
  }

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
    color: #ef4baf;
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
      color: #ef4baf;
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
      height: 100vh;
      width: 100%;
    }
  }
</style>
