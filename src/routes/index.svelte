<script>
  import Button from "$styleguide/components/Button.svelte";
</script>

<div
  class="overflow-hidden md:overflow-visible min-h-screen flex header-container mx-auto justify-center items-center bg-black"
>
  <div class="flex justify-center mx-24 -mt-32">
    <div class="leading-normal">
      <div class="text-gray-500 text-xl font-semibold ml-20 md:ml-0">
        WE ARE DISRUPTING THE NFT INDUSTRY.
      </div>
      <div
        class="text-white text-5xl secondary-font leading-normal mt-4 ml-20 md:ml-0"
      >
        The First marketplace<br />
        for NFT-Experiences
      </div>
      <div class="text-white text-xl secondary-font mt-4 ml-20 md:ml-0">
        From creators for everyone
      </div>
      <div class="text-gray-500 text-base font-semibold mt-6 ml-20 md:ml-0">
        An NFT marketplace with real-life experiences
        <br />based on the L-BTC blockchain.
      </div>
      <div class="mt-8 ml-20 md:ml-0">
        <a href="/market">
          <Button primary>Start Exploring</Button>
        </a>
      </div>
    </div>
    <div class="flex flex-1 ml-20 sm:hidden xl:flex items-center">
      <div>
        <a href="/market">
          <img src="/cards.png" class="w-full max-h-96" alt="Cards" />
        </a>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @import "../styleguide/theme.scss";

  .secondary-font {
    font-family: "Audiowide", sans-serif;
  }
</style>
