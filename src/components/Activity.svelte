<script context="module">
  export async function load({ fetch, page }) {
    const props = await fetch(`/artworks/${page.params.id}.json`).then((r) =>
      r.json()
    );

    return {
      props,
    };
  }
</script>

<script>
  import { Avatar, TransactionTime, TransactionText } from "$comp";
  import Card from "$styleguide/components/Card.svelte";
  import { user } from "$lib/store";
  import { formatDistanceStrict } from "date-fns";

  export let transaction;
  export let showImage = false;
</script>

<div class="flex mb-6 text-left">
  <Avatar user={transaction.user} />
  <div class="ml-3">
    <TransactionText {transaction} />
    <TransactionTime {transaction} />
  </div>
</div>

{#if showImage}
  <div class="mb-24 activity-card">
    <Card artwork={transaction.artwork} columns={2} showDetails={false} />
  </div>
{/if}

<style>
  .activity-card :global(img),
  .activity-card :global(video) {
    object-fit: cover !important;
    height: 400px;
    width: 500px !important;
    box-shadow: 0 1px 3px rgb(0 0 0 / 18%);
    border-radius: 10px;
  }
</style>
