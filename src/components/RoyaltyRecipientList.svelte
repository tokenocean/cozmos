<script>
  import RoyaltyRecipient from "./RoyaltyRecipient.svelte";
  import RoyaltyRecipientAdd from "./RoyaltyRecipientAdd.svelte";
  import { err, royaltyRecipientTypes } from "$lib/utils";

  export let items;
  export let royaltyValue;
  export let maxTotalRate;
  export let artist;

  const validate = (newRecipient) => {
    if (maxTotalRate - royaltyValue - newRecipient.amount < 0) {
      err("Sum of royalty rates should not be more than 100%");
      return false;
    }

    return true;
  };

  $: royaltyValue = items.reduce((a, b) => {
    return a + b["amount"];
  }, 0);

  const addRecipient = (e) => {
    const { newRecipient, cb } = e.detail;

    if (validate(newRecipient)) {
      items = [...items, newRecipient];
      cb();
    }
  };

  const removeRecipient = (e) => {
    items = items.filter((recipient) => recipient.name !== e.detail);
  };

  const addressIsInList = (address) => {
    return !!items.find((item) => item.address === address);
  };
</script>

<RoyaltyRecipientAdd
  defaultAddress={!addressIsInList(artist.address) ? artist.address : ""}
  defaultName={!addressIsInList(artist.address) ? `${artist.username}` : ""}
  on:addrecipient={addRecipient}
/>
<div class="rounded-lg mb-6">
  {#if items.length === 0}
    <div class="bg-gray-200 w-full rounded-lg p-4 text-center">
      <p>No Royalty Recipients</p>
    </div>
  {:else}
    {#each items as recipient}
      <RoyaltyRecipient {recipient} on:removerecipient={removeRecipient} />
    {/each}
  {/if}
</div>
