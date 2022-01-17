<script context="module">
  export async function load({ fetch, params, session }) {
    const props = await fetch(`/artworks/${params.slug}.json`).then((r) =>
      r.json()
    );

    if (!(session && session.user)) return {
      status: 302,
      redirect: '/login'
    }

    return {
      props,
    };
  }

</script>

<script>
  import FileUpload from "$components/FileUpload.svelte";
	import { ProgressLinear, PhotoGallery } from "$comp";
  import Fa from "svelte-fa";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import Form from "../_form.svelte";
  import { getArtwork } from "$queries/artworks";
  import { updateArtwork, updateTags } from "$queries/artworks";
  import { err, goto } from "$lib/utils";
  import { password, user, token } from "$lib/store";
  import { requireLogin, requirePassword } from "$lib/auth";
  import { query } from "$lib/api";

  export let artwork;

  let update = async (e) => {
    e.preventDefault();

    let { id, description, filename, title, tags } = artwork;

    query(updateTags, {
      tags: tags.map(({ tag }) => ({ tag, artwork_id: id })),
      id,
    })
      .then(() => {
        query(updateArtwork, {
          artwork: { description, title, package_content },
          id,
        })
          .then(() => {
            goto(`/a/${artwork.slug}`);
          })
          .catch(err);
      })
      .catch(err);
  };

	let gallery;

</script>

<div class="container mx-auto p-4 md:p-20">
  <div class="w-full max-w-4xl mx-auto bg-gray-100 mt-20 p-4 md:p-10 drop">
      <a class="block mb-6 text-black" href={`/a/${artwork.slug}`}>
        <div class="flex">
          <Fa icon={faChevronLeft} class="my-auto mr-1" />
          <div>Back</div>
        </div>
      </a>
    <h2>Edit experience</h2>
		<div class="md:grid md:grid-cols-2 md:text-left md:p-6 mt-10">
			<FileUpload
				{artwork}
				title="Upload NFT Image"
				type="main"
				limits="PNG, JPG, GIF, MP4, WEBP, MAX 10MB"

			/>
			<FileUpload
				{artwork}
				title="Upload Cover Image"
				type="cover"
				limits="PNG, JPG, WEBP, MAX 10MB"

			/>
			<FileUpload
				{artwork}
				title="Upload Video"
				type="video"
				limits="MP4, MAX 100MB"

			/>
			<FileUpload
				{artwork}
				title="Upload Card Thumbnail"
				type="thumb"
				limits="PNG, JPG, WEBP, MAX 10MB"

			/>
			<FileUpload
				{artwork}
				title="Upload Gallery Photo"
				type="gallery"
				limits="PNG, JPG, WEBP, MAX 10MB"

				previewEnabled={false}
			/>
		</div>
      <Form bind:artwork title={artwork.title} on:submit={update} />
  </div>
</div>

<style>
.drop {
	box-shadow: 8px 8px 8px lightgrey, 8px -1px 8px lightgrey;
}
</style>
