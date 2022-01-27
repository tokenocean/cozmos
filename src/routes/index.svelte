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

<div class="stars mx-auto w-full">
  <Gallery bind:filtered bind:total bind:loadMore />
</div>

<style>
  .stars {
    background: url("/stars.png");
    margin-top: 10rem;
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
