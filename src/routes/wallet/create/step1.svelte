<script>
  import { goto } from "$lib/utils";
  import Button from "$styleguide/components/Button.svelte";
  import Fa from "svelte-fa";
  import {
    faLock,
    faStickyNote,
    faWallet,
  } from "@fortawesome/free-solid-svg-icons";
</script>

<div
  class="border border-transparent w-full px-5 md:px-0 md:bg-black rounded-xl p-10 drop mt-6 md:mt-20"
>
  <div class="w-full md:w-2/3 mx-auto px-6 text-black md:text-white">
    <p class="text-xl mb-10">
      You'll need to know your backup phrase. Some things to have in mind:
    </p>

    <ul class="flex flex-col mb-10">
      <li class="flex">
        <i class="text-black"> <Fa icon={faStickyNote} /></i>
        <span class="-mt-1"
          >Write on actual paper instead of keeping it in a digital format in
          your device.</span
        >
      </li>
      <li class="flex">
        <i class="text-black">
          <Fa icon={faLock} />
        </i>
        <span class="-mt-1"
          >Wait until you are on a personal device and in a private environment.</span
        >
      </li>
      <li class="flex">
        <i class="text-black">
          <Fa icon={faWallet} />
        </i>
        <span class="-mt-1"
          >The backup phrase is essential to restore your wallet. Make sure its
          accurate and kept safe.</span
        >
      </li>
    </ul>

    <a href="/wallet/create/step2">
      <Button primary class="w-full hidden md:block">I'm ready to start</Button>
      <Button
        class="w-full block md:hidden bg-black rounded-full text-white font-bold"
        >I'm ready to start</Button
      >
    </a>
  </div>
</div>

<style>
  li {
    margin-bottom: 30px;
  }
  li span {
    margin-left: 20px;
  }

  @media (min-width: 768px) {
    .border {
      border: 1px solid grey;
    }
  }
</style>
