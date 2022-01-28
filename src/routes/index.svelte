<script context="module">
  import { post } from "$lib/api";
  export async function load({ fetch }) {
    const r = await post("/artworks.json", {}, fetch).json();

    return {
      props: {
        total: r.total,
        initialArtworks: r.artworks,
      },
    };
  }
</script>

<script>
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
  } from "$lib/store";
  import { info, err, goto } from "$lib/utils";
  import { Gallery, Results, Search } from "$comp";
  import Filter from "./_filter.svelte";
  import Sort from "./_sort.svelte";
  import { requirePassword } from "$lib/auth";
  import { compareAsc, differenceInMilliseconds, parseISO } from "date-fns";
  import { browser } from "$app/env";

  export let total;
  export let initialArtworks = [];

  let showFilters;
  let filtered = [...initialArtworks];

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
</script>

<Results />

<div class="stars mx-auto w-full">
  <div class="h-[100vh] splashBackground flex justify-center items-center">
    <div class="w-1/2">
      <div class="h-72 mt-72">
        <h2 class="text-lg text-gray-300 text-center">
          We are disrupting the NFT industry.
        </h2>
        <h1 class="text-white text-4xl text-center">
          The first marketplace for NFT experiences.
        </h1>
      </div>
      <img
        src="/static/svg_icons/mouse.svg"
        alt="mouse icon"
        class="w-36 mx-auto text-white"
      />
      <p class="text-white text-center">E X P L O R E</p>
      <div class="text-white flex justify-center">
        <Fa icon={faChevronDown} />
      </div>
    </div>
    <img
      src="/static/svg_icons/mute.svg"
      alt="mute icon"
      class="right-10 bottom-10 absolute w-36 text-white"
    />
  </div>
  <div
    class="featuredBackground feature flex items-center justify-center h-[100vh]"
  >
    <div class="mx-auto w-1/2">
      <div class="drop rounded-3xl mx-auto w-auto" style="width: 300px">
        <ArtworkMedia artwork={filtered[0]} featured={true} />
      </div>
    </div>
    <div
      class="mx-auto w-1/2 background h-full flex justify-center items-center"
    >
      <div class="ml-48">
        <h2 class="text-3xl text-white w-1/2">
          10 Day Trip Exploration to the Canadian Rockies with Mountaineering
          guide Trail of a Traveller.
        </h2>
        <p class="text-xl text-secondary font-bold m-2">
          Creator: <span class="font-normal">@trailofatraveller</span>
        </p>
        <div class="w-3/5">
          <Card artwork={filtered[0]} summary={true} />
        </div>
        <button
          type="button"
          name="button"
          class="w-3/5 mx-auto backgroundGradientPurple p-2 rounded-xl text-white font-bold m-2"
          >Explore experience</button
        >
      </div>
    </div>
  </div>
  <div
    class="w-full h-20 my-20 flex justify-center items-center background-gradient"
  >
    <h2 class="text-white text-xl">WE ARE DISRUPTING THE NFT INDUSTRY</h2>
  </div>
  <div class="mx-auto container" id="market">
    <div class="flex justify-between m-10 p-4 border-b-[1px] border-gray-500">
      <h2
        class="text-white text-lg rounded-full border border-white w-48 px-10 text-center"
      >
        Market
      </h2>
      <h2 class="text-white text-lg">Out of this world experiences</h2>
    </div>
    <Gallery bind:filtered bind:total bind:loadMore />
  </div>
  <div
    class="background-gradient w-full flex justify-center items-center py-12"
  >
    <div>
      <h2 class="text-center text-black text-xl">FROM CREATORS FOR EVERYONE</h2>
      <p class="text-center text-black font-bold">
        An NFT marketplace with real-life experiences based on the L-BTC
        blockchain.
      </p>

      <div class="flex justify-center items-center text-black">
        <div class="w-72 text-center mx-10 h-96">
          <img
            src="/static/svg_icons/icons-28.svg"
            alt="low fees"
            class="w-72"
          />
          Forget about gas wars and astronomical fees, minting is free and transaction
          fees are literally less than $0.5.
        </div>
        <div class="w-72 text-center mx-10 h-96">
          <img
            src="/static/svg_icons/icons-29.svg"
            alt="amazing experiences"
            class="w-72"
          />
          Buy, sell and trade amazing life changing experiences.
        </div>
        <div class="w-72 text-center mx-10 h-96">
          <img
            src="/static/svg_icons/icons-30.svg"
            alt="awesome community"
            class="w-72"
          />
          Engage with an amazing new community. Join private discords and get early
          access, perks and exlcusive air drops. This is the secret door to your
          wildest dreams!
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .background-gradient {
    background: linear-gradient(
      90deg,
      #fa7900 0%,
      #df36b4 43%,
      #0063ea 77%,
      #00eaaf 100%
    );
  }

  .splashBackground {
    background-image: url("/static/surfing.png");
    background-size: cover;
    box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.25);
  }

  .drop {
    box-shadow: -5px 5px 5px black;
  }

  .background {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .backgroundGradientPurple {
    background-image: linear-gradient(45deg, blue, purple, deeppink);
  }
  .stars {
    background: black url("/stars.png");
  }

  .featuredBackground {
    background-image: url("/static/berta.jpg");
    background-size: cover;
  }

  @media only screen and (max-width: 767px) {
    .primary-btn {
      width: 300px;
      text-align: center;
      margin: 0 auto;
      margin-bottom: 30px;
    }
  }
</style>
