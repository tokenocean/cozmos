<script>
  import WalletPopup from "$styleguide/components/WalletPopup.svelte";
  import { prompt } from "$lib/store";
</script>

<div class="bg-black md:p-12" on:click={() => ($prompt = undefined)}>
  <h1 class="text-3xl text-center text-white mb-6">Wallet</h1>
  <p class="text-center text-white">Thanks for creating your wallet</p>
  <WalletPopup styles={"w-full mx-auto mt-6 bg-white rounded-lg"} />
</div>
