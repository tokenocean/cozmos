<script>
  import Button from "$styleguide/components/Button.svelte";
  import { api } from "$lib/api";
  import { prompt, token } from "$lib/store";

  export let artwork;

  let redeem = async () => {
    await api.url("/redeem").auth(`Bearer ${$token}`).post({
      id: artwork.id,
    });
    $prompt = undefined;
  };
</script>

<div class="py-[14rem] md:p-4">
  <h1 class="text-3xl">Are you sure you want to redeem this experience?</h1>
  <p>You can only redeem an experience once.</p>
  <div class="flex justify-center space-x-4 mt-10">
    <Button primary class="w-32" on:click={redeem}>Yes</Button>
    <button
      type="button"
      name="button"
      class="border border-black rounded-lg w-32"
      on:click={() => ($prompt = undefined)}>No</button
    >
  </div>
</div>
