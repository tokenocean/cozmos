<script>
  import Core from "$lib/lnft-core";
	const core = new Core();
  let text;
  function createComment() {
    core.createComment(text);
  }

</script>

<div class="text-2xl font-bold mt-12">Comments</div>
<div class="border rounded-lg p-10 mt-4">
  <div class="flex">
    <img src="/svg_icons/profile.svg" alt="Avatar" class="w-16 mr-5" />
    <div class="">
      <p class="font-bold">@alice</p>
      <p>This is my comment!</p>
      <p class="text-gray-400">1 day ago</p>
    </div>
  </div>
  <form on:submit|preventDefault={createComment}>
    <textarea name="name" rows="8" class="w-full mt-2" bind:value={text} />
		<button type="submit">Submit</button>
  </form>
</div>
