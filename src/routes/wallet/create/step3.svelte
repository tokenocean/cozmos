<script>
  import { err, goto } from "$lib/utils";
  import Seed from "../_seed.svelte";
  import { getMnemonic } from "$lib/wallet";
  import Button from "$styleguide/components/Button.svelte";
  import { prompt } from "$lib/store";
  import { WalletSuccess } from "$comp";

  let showWalletSuccess = () => {
    $prompt = {
      component: WalletSuccess,
      hide: true,
      dark: true,
    };
  };

  let importWallet;
  let mnemonic;

  let checkMnemonic = async () => {
    if (mnemonic !== getMnemonic())
      return err("Failed to validate backup phrase, please try again");
    await importWallet(mnemonic);
    showWalletSuccess();
  };
</script>

<div class="w-full md:bg-black rounded-xl drop">
  <Seed bind:importWallet bind:mnemonic />

  <div class="flex justify-center gap-6 text-center mt-5">
    <button
      on:click={() => goto("/wallet/create/step2")}
      class="w-2/4 m-2 rounded-lg border border-black md:border-white text-black md:text-white"
      >Back</button
    >
    <Button primary on:click={checkMnemonic} class="hidden md:block w-2/4 m-2"
      >Next</Button
    >
    <Button
      on:click={checkMnemonic}
      class="w-2/4 m-2 bg-black text-white font-bold block md:hidden"
      >Next</Button
    >
  </div>
</div>
