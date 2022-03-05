<script>
  import Button from "$styleguide/components/Button.svelte";
  import { prompt } from "$lib/store";
  import { deleteArtwork } from "$queries/artworks";
  import { goto, err, info } from "$lib/utils";
  import { query } from "$lib/api";

  export let artwork;

  let del = async () => {
    try {
      await query(deleteArtwork, { id: artwork.id });
      info("Artwork deleted successfully");
      goto("/#market");
    } catch (e) {
      console.log(e);
      err("Problem deleting artwork");
    }
    $prompt = undefined;
  };
</script>

<div class="h-[100vh] md:h-auto md:p-4">
  <h1 class="text-3xl">Are you sure you want to delete this experience?</h1>
  <p>This action cannot be undone.</p>
  <div class="flex justify-center space-x-4 mt-10">
    <Button primary class="w-32" on:click={del}>Yes</Button>
    <button
      type="button"
      name="button"
      class="border border-black rounded-lg w-32"
      on:click={() => ($prompt = undefined)}>No</button
    >
  </div>
</div>
