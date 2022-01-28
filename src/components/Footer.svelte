<script>
  import branding from "$lib/branding";
  import Fa from "svelte-fa";
  import {
    faInstagramSquare,
    faDiscord,
    faTwitter,
  } from "@fortawesome/free-brands-svg-icons";
</script>

<div class="bg-black p-2 colored-border relative pb-16">
  <div
    class="container footer mx-auto flex justify-between flex-wrap text-white pt-12"
  >
    <div
      class="flex flex-col text-sm w-full lg:w-2/4 order-last lg:order-first mb-4 md:mb-0"
    >
      <div class="w-96 flex justify-center items-center">
        <a href="/"
          ><img
            src="/static/svg_icons/01-Isotype Cozmos.svg"
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
        class="border border-white rounded-xl font-medium text-white w-72 py-2"
        >About Cozmos</button
      >
    </div>

    <div class="w-full lg:w-1/4 text-gray-500">
      <ul class="list-none font-bold">
        <li class="mb-2">
          <a href="https://blockstream.com/liquid/">The Liquid Network</a>
        </li>
        <li class="mb-2"><a href="/faq">FAQs</a></li>
        <li class="mb-2">
          <a href="mailto:{branding.emails.support}">Support</a>
        </li>
        <li class="mb-2"><a href="/privacy-policy">Privacy Policy</a></li>
        <li class="mb-2">
          <a href="/terms-and-conditions">Terms of Service</a>
        </li>
      </ul>
    </div>
  </div>
  <div
    class="container footer mx-auto flex justify-between flex-wrap text-white border-t-[1px] border-gray-500"
  >
    <div>
      <p class="pr-3 mb-4 text-sm mt-3">Powered by:</p>
      <img src="/liquid_logo.svg" alt="liquid network logo" />
    </div>
    <div class="flex justify-center items-center space-x-8 mt-4 md:mt-0">
      <p class="text-sm">Copyright 2021 {branding.projectName} Cozmos.</p>
      <a href={branding.urls.external.instagram}>
        <Fa icon={faInstagramSquare} /></a
      >
      <a href={branding.urls.external.discord}> <Fa icon={faDiscord} /></a>
      <a href={branding.urls.external.twitter}><Fa icon={faTwitter} /> </a>
    </div>
  </div>
</div>

<style lang="scss">
  .colored-border {
    &:before {
      content: "";
      display: block;
      position: absolute;
      left: 0;
      top: -20px;
      right: 0;
      height: 20px;
      background: #fa7900; /* Old browsers */
      background: linear-gradient(
        90deg,
        #fa7900 0%,
        #df36b4 43%,
        #0063ea 77%,
        #00eaaf 100%
      );
    }
  }
</style>
