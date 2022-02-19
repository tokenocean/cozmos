<script>
  import Seed from "./_seed.svelte";
  let mnemonic;
  let importWallet;
  import Button from "$styleguide/components/Button.svelte";
</script>

<div class="w-full">
  <Seed bind:importWallet bind:mnemonic />

  <div class="block flex justify-center gap-6 text-center mt-5">
    <Button
      primary
      on:click={() => importWallet(mnemonic)}
      class="hidden md:block w-2/4">Next</Button
    >
    <Button
      on:click={() => importWallet(mnemonic)}
      class="block md:hidden bg-black rounded-full text-white font-bold w-2/4"
      >Next</Button
    >
  </div>
</div>
