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
  import Card from "$styleguide/components/Card.svelte";
  import { ProgressLinear } from "$comp";
  import Fa from "svelte-fa";
  import { faSlidersH } from "@fortawesome/free-solid-svg-icons";
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

<div class="stars mx-auto w-full mt-[5.25rem]">
  <div class="h-[75vh] splashBackground" />
  <div
    class="featuredBackground feature flex items-center justify-center h-[75vh]"
  >
    <div class="mx-auto w-1/2">
      <div class="drop rounded-3xl mx-auto w-1/2">
        <Card artwork={filtered[0]} cover={true} showDetails={false} />
      </div>
    </div>
    <div
      class="mx-auto w-1/2 background h-full flex justify-center items-center"
    >
      <div class="ml-48">
        <h2 class="text-3xl text-white w-1/2">
          10 Day Trip Exploration trip to the Canadian Rockies with
          Mountaineering guide Trail of a traveller
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
  <div class="mx-auto container">
    <Gallery bind:filtered bind:total bind:loadMore />
  </div>
</div>

<style>
  .splashBackground {
    background-image: url("/static/surfing.png");
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
    object-fit: scale-down;
    background-position: center;
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
