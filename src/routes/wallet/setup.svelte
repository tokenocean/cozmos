<script>
  import { goto } from "$lib/utils";
  import { user, wallet } from "$lib/store";
  import Button from "$styleguide/components/Button.svelte";
</script>

{#if $user}
  <div class="border w-full px-5 bg-black p-24 rounded-xl drop mt-20">
    <p class="mb-6 text-xl p-4 text-white text-center">
      Welcome! Choose your option to get started
    </p>
    <div class="text-center flex flex-col">
      <a href="/wallet/create" class="m-2">
        <Button primary class="w-full">
          {$user.wallet_initialized ? "Backup" : "Create new"} wallet
        </Button>
      </a>
      <a href="/wallet/import" class="m-2">
        <Button primary class="w-full">Import wallet from seed</Button></a
      >
    </div>
  </div>
{/if}

<style>
  .border {
    border: 1px solid grey;
  }
</style>
