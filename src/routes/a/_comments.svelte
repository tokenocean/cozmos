<script>
  import Core from "$lib/lnft-core";
  import { Avatar, ProgressLinear } from "$comp";
  import { formatDistanceStrict } from "date-fns";
  import Fa from "svelte-fa";
  import {
    faChevronDown,
    faChevronRight,
  } from "@fortawesome/free-solid-svg-icons";
  import { requireLogin } from "$lib/auth";

  export let artwork;
  export let fetch;

  let loading;

  const core = new Core();
  let comment;
  async function createComment() {
    await requireLogin();
    loading = true;
    await core.createComment(artwork.id, comment);
    await fetch();
    comment = "";
    loading = false;
  }

  let commentsToggle = "hidden";
</script>

<div class="border rounded-lg mt-12 p-4">
  <div
    class="text-2xl font-bold flex justify-between items-center cursor-pointer"
    on:click={() => {
      if (commentsToggle === "hidden") {
        commentsToggle = "block";
      } else {
        commentsToggle = "hidden";
      }
    }}
  >
    Comments <Fa
      icon={commentsToggle === "block" ? faChevronDown : faChevronRight}
    />
  </div>
  <div class="mt-4 {commentsToggle}">
    {#if !artwork.comments.length}
      <p>Be the first to leave a comment!</p>
    {/if}
    {#each artwork.comments as comment}
      <div class="flex mb-4">
        <a href="https://www.cozmos.io/{comment.user.username}"
          ><Avatar user={comment.user} size="lg" /></a
        >
        <div class="ml-10">
          <div class="font-bold">
            <a href="https://www.cozmos.io/{comment.user.username}"
              >@{comment.user.username}</a
            >
          </div>
          <div>{comment.comment}</div>
          <div class="text-sm text-gray-400">
            {formatDistanceStrict(new Date(comment.created_at), new Date())}
            ago
          </div>
        </div>
      </div>
    {/each}
    {#if loading}
      <ProgressLinear />
    {:else}
      <form on:submit|preventDefault={createComment}>
        <textarea
          name="name"
          rows="8"
          class="w-full mt-8 border rounded"
          bind:value={comment}
        />
        <button type="submit" class="primary-btn ml-auto">Add comment</button>
      </form>
    {/if}
  </div>
</div>
