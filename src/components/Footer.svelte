<script>
  import branding from "$lib/branding";
  import Fa from "svelte-fa";
  import { goto } from "$lib/utils";

  let date = new Date();
  let year = date.getFullYear();
</script>

<div class="bg-black p-2 relative pb-16">
  <div
    class="container footer mx-auto flex justify-between flex-wrap text-white pt-12"
  >
    <div class="flex flex-col text-sm w-full lg:w-2/4 mb-4 md:mb-0">
      <div class="w-full md:w-1/2 flex justify-center items-center">
        <a href="/"
          ><img
            src="/svg_icons/01-Isotype Cozmos.svg"
            alt="logo"
            class="w-48"
          /></a
        >
        <p class="text-gray-500 font-medium">
          An NFT marketplace with real-life experiences based on the L-BTC
          blockchain.
        </p>
      </div>
      <button
        type="button"
        name="button"
        class="border border-white rounded-xl font-medium text-white w-2/3 md:w-1/2 py-2"
        on:click={() => goto("/about")}>About Cozmos</button
      >
    </div>

    <div class="w-full lg:w-1/4 text-gray-500">
      <ul class="list-none">
        <li>
          <a href="https://blockstream.com/liquid/">The Liquid Network</a>
        </li>
        <li><a href="/faq">FAQs</a></li>
        <li>
          <a
            href="https://discord.com/invite/K393aHGV3M"
            target="_blank"
            rel="noreferrer">Support</a
          >
        </li>
        <li><a href="/privacy-policy">Privacy Policy</a></li>
        <li>
          <a href="/terms-and-conditions">Terms and Conditions</a>
        </li>
      </ul>
    </div>
  </div>
  <div
    class="container footer mx-auto flex justify-between flex-wrap text-white border-t-[1px] border-gray-500"
  >
    <div>
      <p class="pr-3 mb-4 text-sm mt-3">Powered by:</p>
      <a href="https://liquid.net/"
        ><img
          src="/liquid_logo.svg"
          alt="liquid network logo"
          class="my-2"
        /></a
      >
      <a href="https://tokenocean.io"
        ><img
          src="/tokenocean2.png"
          alt="Token Ocean logo"
          class="my-2 w-[7.5rem]"
        /></a
      >
      <a href="https://coinos.io"
        ><img src="/Coinos.png" alt="coinos logo" class="my-2 w-[7rem]" /></a
      >
    </div>
    <div class="flex justify-center items-center mt-4 md:mt-0">
      <p class="text-sm">Copyright {year} {branding.projectName}.</p>
      <a
        href={branding.urls.external.instagram}
        target="_blank"
        rel="noreferrer"
      >
        <img src="/Instagram-02.svg" alt="Instagram" class="w-20" />
      </a>
      <a href={branding.urls.external.discord} target="_blank" rel="noreferrer">
        <img src="/Discord.svg" alt="Discord" class="w-20" />
      </a>
      <a href={branding.urls.external.twitter} target="_blank" rel="noreferrer">
        <img src="/Twitter-02.svg" alt="Twitter" class="w-20" />
      </a>
    </div>
  </div>
</div>
