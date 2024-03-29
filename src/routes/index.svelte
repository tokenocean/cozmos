<script context="module">
  import { post } from "$lib/api";
  export async function load({ fetch }) {
    const artworksData = await post("/artworks.json", {}, fetch).json();
    const featuredArtworkData = await post(
      "/artworks/featured.json",
      {},
      fetch
    ).json();

    return {
      props: {
        total: artworksData.total,
        initialArtworks: artworksData.artworks,
        featuredArtwork: featuredArtworkData.featured,
      },
    };
  }
</script>

<script>
  import { session } from "$app/stores";
  import * as animateScroll from "svelte-scrollto";
  import ArtworkMedia from "$components/ArtworkMedia.svelte";
  import Card from "$styleguide/components/Card.svelte";
  import { ProgressLinear } from "$comp";
  import Fa from "svelte-fa";
  import { faSlidersH, faChevronDown } from "@fortawesome/free-solid-svg-icons";
  import {
    artworks,
    filterCriteria as fc,
    offset,
    results,
    show,
    sortCriteria as sc,
    token,
    user,
    prompt,
  } from "$lib/store";
  import { info, err, goto } from "$lib/utils";
  import { Gallery, Results, Search, ConnectWallet } from "$comp";
  import Filter from "./_filter.svelte";
  import Sort from "./_sort.svelte";
  import { requirePassword } from "$lib/auth";
  import { compareAsc, differenceInMilliseconds, parseISO } from "date-fns";
  import { browser } from "$app/env";
  import Button from "$styleguide/components/Button.svelte";

  export let total;
  export let initialArtworks = [];
  export let featuredArtwork;

  let showFilters;
  let filtered = [...initialArtworks];
  let displayedFeaturedArtwork = featuredArtwork.length
    ? featuredArtwork[0].artwork
    : filtered[0];
  let displayedFeaturedBackground = featuredArtwork.length
    ? featuredArtwork[0].background
    : "/berta.jpg";
  let displayedFeaturedVideo = featuredArtwork.length
    ? featuredArtwork[0].video
    : "/landing_video.mp4";

  $: filtersUpdated($fc, $sc);
  let filtersUpdated = () => {
    $offset = 0;
    loadMore();
  };

  let loadMore = async () => {
    if (!browser) return;
    try {
      let where = {};
      if ($sc === "ending_soon")
        where.auction_end = { _is_null: false, _gte: new Date() };
      if ($fc.listPrice || ["lowest", "highest"].includes($sc)) {
        $fc.listPrice = true;
        where.list_price = { _is_null: false, _gt: 0 };
      }
      if ($fc.openBid) where.bid_id = { _is_null: false };
      if ($fc.ownedByCreator) where.artist_owned = { _eq: true };
      if ($fc.hasSold) where.transferred_at = { _is_null: false };

      let order_by = {
        newest: { created_at: "desc" },
        oldest: { created_at: "asc" },
        highest: { list_price: "desc" },
        lowest: { list_price: "asc" },
        ending_soon: { auction_end: "asc" },
        most_viewed: { views: "desc" },
      }[$sc];

      const r = await post(
        "/artworks.json",
        { offset: $offset, order_by, where },
        fetch
      ).json();

      filtered = [...r.artworks];
      total = r.total;
    } catch (e) {
      console.log(e);
    }
  };

  let muted = "muted";
  let soundIcon;

  let showConnect = () => {
    $prompt = {
      component: ConnectWallet,
      hide: true,
      rainbow: true,
    };
  };
</script>

<Results />
{#if filtered.length}
  <div class="stars mx-auto w-full">
    <div
      class="w-full h-[80vh] md:h-[100vh] backgroundImage splashBackground flex justify-center items-center"
    >
      <video
        src={"/landing_video.mp4"}
        preload
        autoplay
        loop
        {muted}
        class="hidden md:block w-full absolute z-0"
      />
      <div class="z w-full md:w-1/2">
        <div>
          <div class="my-auto h-auto mt-10">
            <h1
              class="mb-4 md:mb-0 text-3xl lg:text-4xl text-gradient text-center tracking-widest"
            >
              NFT-TICKETING MARKETPLACE
            </h1>
            <h1
              class="italic text-white mb-6 md:mb-0 text-2xl lg:text-3xl text-center"
            >
              FROM CREATORS TO EVERYONE
            </h1>
            <p class="text-center mt-5 text-white">
              An NFT Marketplace with real-life <strong
                >Events/Experiences based on the L-BTC blockchain.</strong
              >
            </p>
          </div>
          <img
            src="/svg_icons/mute.svg"
            alt="mute icon"
            class="hidden md:block w-36 mx-auto text-white cursor-pointer lg:mt-20"
            bind:this={soundIcon}
            on:click={() => {
              if (muted === "muted") {
                muted = "";
                soundIcon.src = "/svg_icons/sound_on.svg";
              } else {
                muted = "muted";
                soundIcon.src = "/svg_icons/mute.svg";
              }
            }}
          />
        </div>

        <div
          class="mt-5 flex md:hidden justify-center space-x-4 items-center px-6"
        >
          <a href="/#market" class="w-full"
            ><Button primary rounded="rounded-full">Explore</Button></a
          >
          {#if !$session?.user}
            <a
              href="/wallet"
              class="w-full bg-black rounded-full font-bold text-white py-2"
              ><button on:click|preventDefault={showConnect}
                >Create wallet</button
              ></a
            >{/if}
        </div>
      </div>
    </div>

    <div
      class="featuredBackground feature block lg:flex items-center justify-center h-auto lg:h-[100vh]"
      style={`background-image: url(${displayedFeaturedBackground});`}
    >
      <div class="mx-auto flex lg:block justify-center w-9/12 lg:w-1/2">
        <div
          class="drop rounded-3xl mx-auto w-auto my-6 lg:my-0"
          style="width: 300px"
        >
          <ArtworkMedia artwork={displayedFeaturedArtwork} featured={true} />
        </div>
      </div>
      <div
        class="px-5 md:px-0 mx-auto w-full lg:w-1/2 background h-full flex justify-center items-center"
      >
        <div class="w-full md:w-[60%] mx-auto pt-6 lg:pt-6">
          <h2 class="mx-2 md:mx-0 pt-4 md:pt-0 text-3xl text-white text-left">
            <Card
              artwork={displayedFeaturedArtwork}
              showDetails={false}
              summary={true}
              titleOnly={true}
            />
          </h2>
          <p class="text-xl text-secondary font-bold my-2 px-2 md:px-0">
            Creator: <span class="font-normal"
              ><Card
                artwork={displayedFeaturedArtwork}
                showDetails={false}
                summary={true}
                usernameOnly={true}
              /></span
            >
          </p>
          <div class="w-full px-2 md:px-0">
            <Card
              artwork={displayedFeaturedArtwork}
              summary={true}
              textSize0={"text-lg"}
              textSize1={"text-xl"}
              height={"h-auto"}
            />
          </div>
          <div class="mx-2 md:mx-0">
            <Card
              artwork={displayedFeaturedArtwork}
              showDetails={false}
              summary={true}
              artworkButton={true}
            />
          </div>
        </div>
      </div>
    </div>
    <div
      class="hidden md:flex w-full h-20 my-14 md:my-20 justify-center items-center background-gradient"
    >
      <marquee>
        <h2 class="text-white text-xl text-center md:text-left">
          WE ARE DISRUPTING THE NFT INDUSTRY
        </h2></marquee
      >
    </div>
    <div class="mx-auto container" id="market">
      <div
        class="block md:flex justify-between m-10 p-0 md:p-4 md:border-b-[1px] border-gray-500"
      >
        <h2
          class="text-white text-2xl md:text-xl rounded-full md:border border-white w-48 px-10 text-center mx-auto md:mx-0 mb-2 md:mb-0 pt-10 md:pt-0"
        >
          Market
        </h2>
        <h2 class="text-white text-sm text-center md:text-left mb-2 md:mb-0">
          Out of this world experiences
        </h2>
      </div>
      <Gallery bind:filtered bind:total bind:loadMore />
    </div>
    <div
      class="background-gradient w-full block md:flex justify-center items-center py-20"
    >
      <div>
        <h2 class="text-center text-black text-xl">FROM CREATORS</h2>
        <h2 class="text-center text-black text-xl">FOR EVERYONE</h2>
        <p class="text-center text-black font-bold">
          An NFT marketplace with real-life experiences based on the L-BTC
          blockchain.
        </p>

        <div class="block md:flex justify-center items-center text-black">
          <div
            class="w-[80%] md:w-[20%] text-center mx-auto lg:mx-20 h-auto md:h-96"
          >
            <img src="/svg_icons/icons-28.svg" alt="low fees" class="w-full" />
            Forget about gas wars and astronomical fees, minting is free and transaction
            fees are literally less than $0.05.
          </div>
          <div
            class="w-[80%] md:w-[20%] text-center mx-auto lg:mx-20 h-auto md:h-96"
          >
            <img
              src="/svg_icons/icons-29.svg"
              alt="amazing experiences"
              class="w-full"
            />
            Buy, sell and trade amazing life changing experiences.
          </div>
          <div
            class="w-[80%] md:w-[20%] text-center mx-auto lg:mx-20 h-auto md:h-96"
          >
            <img
              src="/svg_icons/icons-30.svg"
              alt="awesome community"
              class="w-full"
            />
            Engage with an amazing new community. Join private discords and get early
            access, perks and exlcusive air drops. This is the secret door to your
            wildest dreams!
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  No experiences have been uploaded.
{/if}

<style>
  .backgroundImage {
    background: black url("/surfing_mobile.jpg");
    background-size: cover;
    background-position: center;
  }

  .z {
    z-index: 1;
  }

  .background-gradient {
    background: linear-gradient(
      90deg,
      #fa7900 0%,
      #df36b4 43%,
      #0063ea 77%,
      #00eaaf 100%
    );
  }

  .stars {
    background-color: #171717;
  }

  .splashBackground {
    box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.25);
  }

  .drop {
    box-shadow: -5px 5px 5px black;
  }
  .background {
    background-color: none;
  }

  .featuredBackground {
    background-color: #171717;
    background-size: cover;
    background-position: center;
  }

  @media (min-width: 768px) {
    .background {
      background-color: rgba(0, 0, 0, 0.5);
    }
    .stars {
      background: black url("/stars.png");
      box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.5);
    }
    .backgroundImage {
      background: none;
    }
  }
</style>
