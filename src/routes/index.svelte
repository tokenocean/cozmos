<script>
  import { onDestroy } from "svelte";
  import { query } from "$lib/api";
  import { Summary } from "$comp";
  import { fade } from "svelte/transition";
  import { user } from "$lib/store";
  import { Activity, RecentActivityCard, LatestPiecesCard } from "$comp";
  import { err } from "$lib/utils";
  import branding from "$lib/branding";

  export let featured;
  export let recent;
  export let latest;

  let interval = setInterval(() => {
    if (!featured) return;
    current++;
    if (current >= featured.length) current = 0;
  }, 6000);

  onDestroy(() => clearInterval(interval));

</script>

<div
  class="min-h-screen flex header-container mx-auto justify-center items-center bg-black">
  <div class="flex justify-center mx-24 -mt-32">
    <div class="leading-normal">
      <div class="text-gray-500 text-xl font-semibold">
        WE ARE DISRUPTING THE NFT INDUSTRY.
      </div>
      <div
        class="text-white text-5xl secondary-font font-bold leading-normal mt-4">
        The First marketplace<br />
        for NFT-Experiences
      </div>
      <div class="text-white text-xl secondary-font font-bold mt-4">
        From creators for everyone
      </div>
      <div class="text-gray-500 text-base font-semibold mt-6">
        An NFT marketplace with real-life experiences
        <br />based on the L-BTC blockchain.
      </div>
      <div class="mt-8">
        <a href="/market">
          <Button primary>Start Exploring</Button>
        </a>
      </div>
    </div>
    <div class="flex flex-1 ml-20 sm:hidden xl:flex items-center">
      <div>
        <a href="/market"> <img src="/cards.png" class="w-full max-h-96" /> </a>
      </div>
    </div>
  </div>
</div>
