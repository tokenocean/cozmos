<script context="module">
  export async function load({ fetch, params, session }) {
    if (!(session && session.user))
      return {
        status: 302,
        redirect: "/login",
      };

    const props = await fetch(`/artworks/${params.slug}.json`).then((r) =>
      r.json()
    );

    console.log("PROPS", props);

    return {
      props,
    };
  }
</script>

<script>
  import { ProgressLinear } from "$comp";
  import Fa from "svelte-fa";
  import Core from "$lib/lnft-core";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import Form from "../_form.svelte";
  import { updateArtwork, updateTags } from "$queries/artworks";
  import { err, goto } from "$lib/utils";
  import { password, user, token } from "$lib/store";
  import { requireLogin, requirePassword } from "$lib/auth";
  import { query } from "$lib/api";

  export let artwork;
  const core = new Core();
  const current = { ...artwork };
  let royalty_value;

  let files = artwork.files;

  let update = async (e) => {
    e.preventDefault();

    await requirePassword();

    try {
      let { id, description, filename, package_content, title, tags } = artwork;

      await query(updateTags, {
        tags: tags.map(({ tag }) => ({ tag, artwork_id: id })),
        id,
      });

      await query(updateArtwork, {
        artwork: { description, title, package_content },
        id,
      });

      await core.listArtwork(artwork, current, files);

      goto(`/a/${artwork.slug}`);
    } catch (e) {
      err(e);
    }
  };
</script>

<div class="container mx-auto p-4 md:p-20">
  <div class="w-full max-w-4xl mx-auto bg-gray-100 mt-20 p-4 md:p-10 drop">
    <a class="block mb-6 text-black" href={`/a/${artwork.slug}`}>
      <div class="flex">
        <Fa icon={faChevronLeft} class="my-auto mr-1" />
        <div>Back</div>
      </div>
    </a>
    {#if $user && $user.id === artwork.owner_id}
      <h2 class="mb-8">
        {$user.id !== artwork.artist_id ? "Set price" : "Edit experience"}
      </h2>
    {/if}
    <Form bind:artwork bind:files on:submit={update} />
  </div>
</div>

<style>
  .drop {
    box-shadow: 8px 8px 8px lightgrey, 8px -1px 8px lightgrey;
  }
</style>
