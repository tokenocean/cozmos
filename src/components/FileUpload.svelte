<script>
  import { tick } from "svelte";
  import { err } from "$lib/utils";
  import { upload, supportedTypes } from "$lib/upload";
  import FormItem from "$components/FormItem.svelte";
  import { createEventDispatcher } from "svelte";
  import { ArtworkMedia, Dropzone } from "$comp";

  export let artwork;
  export let title;
  export let type;
  let file;
  let preview;
  let percent;

  const dispatch = createEventDispatcher();

  const cancelPreview = () => {
    preview = null;
    percent = 0;
  };

  let showPreview = (file) => {
    var reader = new FileReader();

    reader.onload = async (e) => {
      percent = 1;
      preview = e.target.result;
      await tick();
      if (file.filetype.includes("video")) {
        preview = URL.createObjectURL(file.file);
      }
    };

    reader.readAsDataURL(file.file);
  };

  const uploadFile = async ({ detail }) => {
    if (!detail.file) return;
    try {
      file = {
        file: detail.file,
        type,
        filetype: detail.file.type,
      };

      if (detail.file.size < 100000000) showPreview(file);
      file.hash = await upload(detail.file, progress);

      if (supportedTypes.includes(file.filetype))
        throw new Error("Supported file types are jpg, png, gif, mp4");

      file.preview = preview;
      dispatch('upload', file);
    } catch (e) {
      err(e);
      percent = undefined;
      return;
    }
  };
  let progress = async (event) => {
    percent = Math.round((event.loaded / event.total) * 100);

    if (percent >= 100) {
      await tick();
    }
  };

  //  dispatch("file", dt.files[0]);
</script>

<div>
  <FormItem title="Upload NFT image" text="text-center">
    {#if preview || percent}
      <div class="text-black">
        {#if percent && parseInt(percent) < 100}
          Loading...
        {:else if percent === 100}
          <div class="w-1/2 mx-auto">
            <ArtworkMedia
              {artwork}
              {preview}
              on:cancel={cancelPreview}
            />
          </div>
        {/if}
      </div>
    {:else}
      <Dropzone on:file={uploadFile} />
    {/if}
  </FormItem>
</div>
