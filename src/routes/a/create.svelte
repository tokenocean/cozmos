<script context="module">
  export async function load({ session }) {
    if (!(session && session.user))
      return {
        status: 302,
        redirect: "/login",
      };

    return {};
  }
</script>

<script>
  import Card from "$styleguide/components/Card.svelte";
  import Core from "$lib/lnft-core";
  import { page } from "$app/stores";
  import { query } from "$lib/api";
  import { onMount, tick } from "svelte";
  import { prompt, token, psbt, user } from "$lib/store";
  import { Dropzone, ProgressLinear, ThankYou } from "$comp";
  import { upload, supportedTypes } from "$lib/upload";
  import { create } from "$queries/artworks";
  import { btc, fade, kebab, goto, err } from "$lib/utils";
  import { requirePassword } from "$lib/auth";
  import {
    createIssuance,
    sign,
    broadcast,
    parseAsset,
    keypair,
  } from "$lib/wallet";
  import reverse from "buffer-reverse";
  import { ArtworkMedia } from "$comp";
  import branding from "$lib/branding";

  import Form from "./_form.svelte";
  import FormItem from "./components/_form-item.svelte";
  import Issuing from "./_issuing.svelte";

  let preview;
  let filename;
  let type;
  let tags;
  let video;
  let hidden = true;
  let loading;

  const IMG_TYPES = {
    MAIN: 0,
    COVER: 1,
  };

  const imagePreview = [null, null];
  const imagePercent = [0, 0];

  let previewFile = (imageType, file) => {
    var reader = new FileReader();

    reader.onload = async (e) => {
      imagePercent[imageType] = 1;
      imagePreview[imageType] = e.target.result;
      await tick();
      if (type.includes("video")) {
        imagePreview[imageType] = URL.createObjectURL(file);
      } else {
        url = preview;
      }
    };

    reader.readAsDataURL(file);
  };

  let percent;
  let progress = (imageType) => {
    return async (event) => {
      imagePercent[imageType] = Math.round((event.loaded / event.total) * 100);

      if (imagePercent[imageType] >= 100) {
        await tick();
      }
    };
  };

  let hash, tx;
  const issue = async (ticker) => {
    let contract;
    let domain =
      $user.username === branding.superUserName
        ? branding.urls.base
        : `${$user.username.toLowerCase()}.${branding.urls.base}`;

    let error, success;

    await requirePassword();

    try {
      contract = await createIssuance(artwork, domain, tx);

      await sign();
      await broadcast(true);
      await tick();
    } catch (e) {
      if (e.message.includes("Insufficient")) throw e;
      throw new Error("Issuance failed: " + e.message);
    }

    tx = $psbt.extractTransaction();
    artwork.asset = parseAsset(
      tx.outs.find((o) => parseAsset(o.asset) !== btc).asset
    );
    hash = tx.getId();

    return JSON.stringify(contract);
  };

  let url;
  const uploadFile = (imageType) => {
    return async ({ detail: { file } }) => {
      if (!file) return;
      if (supportedTypes.includes(type))
        throw new Error("Supported file types are jpg, png, gif, mp4");
      ({ type } = file);

      if (imageType === IMG_TYPES.MAIN) {
        artwork.filetype = type;
      }

      if (file.size < 100000000) previewFile(imageType, file);

      try {
        if (imageType === IMG_TYPES.MAIN) {
          artwork.filename = await upload(file, progress(imageType));
        } else if (imageType === IMG_TYPES.COVER) {
          artwork.cover_filename = await upload(file, progress(imageType));
        }
      } catch (e) {
        err(e);
        imagePercent[imageType] = 0;
        return;
      }
    };
  };

  let tries;
  let l;

  let title;

  $: generateTicker(title);
  let generateTicker = (t) => {
    if (!t) return;
    artwork.ticker = (
      t.split(" ").length > 2
        ? t
            .split(" ")
            .map((w) => w[0])
            .join("")
        : t
    )
      .substr(0, 3)
      .toUpperCase();

    checkTicker();
  };

  let checkTicker = async () => {
    let { data } = await hasura
      .auth(`Bearer ${$token}`)
      .post({
        query: `query { artworks(where: { ticker: { _like: "${artwork.ticker.toUpperCase()}%" }}) { ticker }}`,
      })
      .json();

    if (!data.errors && data.artworks && data.artworks.length) {
      let tickers = data.artworks.sort(({ ticker: a }, { ticker: b }) =>
        b.length < a.length
          ? 1
          : b.length > a.length
          ? -1
          : a.charCodeAt(a.length - 1) - b.charCodeAt(b.length - 1)
      );

      if (tickers.map((a) => a.ticker).includes(artwork.ticker)) {
        let { ticker } = tickers.pop();
        artwork.ticker =
          ticker.substr(0, 3) + c[c.indexOf(ticker.substr(3)) + 1];
      }
    }
  };

  let artwork = {
    asking_asset: btc,
    title: "",
    description: "",
    filename: "",
    filetype: "",
    ticker: "",
    package_content: "",
    asset: btc,
    edition: 1,
    editions: 1,
    tags: [],
    owner: $user,
    artist: $user,
    list_price: null,
    reserve_price: null,
    auction_start: null,
    auction_end: null,
  };

  async function submit(e) {
    e.preventDefault();

    await requirePassword();

    if (!artwork.title) return err("Title is required");

    if (!artwork.description) return err("Description is required");

    if (!artwork.description) return err("Description is required");

    if (!artwork.editions || isNaN(Number(artwork.editions)))
      return err("Editions is required and should be a number");

    const core = new Core();
    let showThanks = () => {
      $prompt = {
        component: ThankYou,
        hide: true,
      };
    };

    try {
      if (artwork.editions > 1) {
        $prompt = Issuing;
      }
      loading = true;
      let strippedDown = { ...artwork };
      delete strippedDown.owner;
      delete strippedDown.artist;
      await core.createArtwork({
        artwork: strippedDown,
        // for Cozmos client we should generate tickers automatically,
        // and check their availability
        generateRandomTickers: true,
      });
      showThanks();
    } catch (e) {
      err(e);
      loading = false;
      $prompt = undefined;
    }
  }

  function cancelPreview(imageType) {
    return () => {
      imagePreview[imageType] = null;
      imagePercent[imageType] = 0;
    };
  }

  let close = () => {
    goto("/market");
  };
</script>

<div class="container mx-auto p-20">
  <div class="flex w-full mx-auto bg-gray-100 submitArtwork">
    <div
      class="absolute right-16 rounded-full border-black border-l border-t w-8 h-8 -mt-4 z-50 bg-black text-4xl text-center text-white cursor-pointer"
      on:click={close}
    >
      <div class="-mt-2">&times;</div>
    </div>
    <div class="flex flex-col w-1/3">
      <div class="flex-grow-1 h-full bg-black">
        <h2 class="text-white p-14">Preview experience</h2>
        {#if $user}
        <div class="w-2/3 mx-auto bg-gray-500 rounded-3xl">
          <Card {artwork} preview={imagePreview[IMG_TYPES.MAIN]} />
        </div>
      {/if}
        <div
          style="background-image: url('/stars.png')"
          class="h-full bg-left mt-auto bg-repeat w-full"
        />
      </div>
    </div>
    <div class="p-14">
      <div class="w-3/5 mx-auto text-center mb-12">
        <h2>Create Experience</h2>
        <p>
          Here at Cozmos we value the experience more than the "Art" itself, in
          the sense that we will always put the experience given to the buyer
          1st.
        </p>
        <p />
        <p>
          <b>Please make sure you are giving an Added value to the "Art"</b>
        </p>
      </div>

      <div class="grid grid-cols-2 text-left">
        <div>
          <FormItem title="Upload NFT image" text="text-center">
            {#if imagePreview[IMG_TYPES.MAIN] || imagePercent[IMG_TYPES.MAIN]}
              <div class="text-black">
                {#if imagePercent[IMG_TYPES.MAIN] && imagePercent[IMG_TYPES.MAIN] < 100}
                  Loading...
                {:else if imagePercent[IMG_TYPES.MAIN] && imagePercent[IMG_TYPES.MAIN] === 100}
                  <div class="w-1/2 mx-auto">
                    <ArtworkMedia
                      {artwork}
                      preview={imagePreview[IMG_TYPES.MAIN]}
                      on:cancel={cancelPreview(IMG_TYPES.MAIN)}
                    />
                  </div>
                {/if}
              </div>
            {:else}
              <Dropzone on:file={uploadFile(IMG_TYPES.MAIN)} />
            {/if}
          </FormItem>
        </div>
        <div>
          <FormItem title="Upload thumbnail (optional)" text="text-center">
            {#if imagePreview[IMG_TYPES.THUMB] || imagePercent[IMG_TYPES.THUMB]}
              <div class="text-black">
                {#if imagePercent[IMG_TYPES.THUMB] && imagePercent[IMG_TYPES.THUMB] < 100}
                  Loading...
                {:else if imagePercent[IMG_TYPES.THUMB] && imagePercent[IMG_TYPES.THUMB] === 100}
                  <div class="w-1/2 mx-auto">
                    <ArtworkMedia
                      {artwork}
                      preview={imagePreview[IMG_TYPES.THUMB]}
                      on:cancel={cancelPreview(IMG_TYPES.THUMB)}
                    />
                  </div>
                {/if}
              </div>
            {:else}
              <Dropzone on:file={uploadFile(IMG_TYPES.MAIN)} />
            {/if}
          </FormItem>
        </div>
        <div>
          <FormItem title="Upload cover banner" text="text-center">
            {#if imagePreview[IMG_TYPES.COVER] || imagePercent[IMG_TYPES.COVER]}
              <div class="text-black">
                {#if imagePercent[IMG_TYPES.COVER] && imagePercent[IMG_TYPES.COVER] < 100}
                  Loading...
                {:else if imagePercent[IMG_TYPES.COVER] && imagePercent[IMG_TYPES.COVER] === 100}
                  <div class="w-1/2 mx-auto">
                    <ArtworkMedia
                      {artwork}
                      preview={imagePreview[IMG_TYPES.COVER]}
                      on:cancel={cancelPreview(IMG_TYPES.COVER)}
                    />
                  </div>
                {/if}
              </div>
            {:else}
              <Dropzone on:file={uploadFile(IMG_TYPES.COVER)} />
            {/if}
          </FormItem>
        </div>
        <!-- need to hook these 2 new dropzones to backend and other frontend locations -->
        <div>
          <FormItem title="Upload gallery images" text="text-center">
            {#if imagePreview[IMG_TYPES.CONTENT] || imagePercent[IMG_TYPES.CONTENT]}
              <div class="text-black">
                {#if imagePercent[IMG_TYPES.CONTENT] && imagePercent[IMG_TYPES.CONTENT] < 100}
                  Loading...
                {:else if imagePercent[IMG_TYPES.CONTENT] && imagePercent[IMG_TYPES.CONTENT] === 100}
                  <div class="w-1/2 mx-auto">
                    <ArtworkMedia
                      {artwork}
                      preview={imagePreview[IMG_TYPES.CONTENT]}
                      on:cancel={cancelPreview(IMG_TYPES.CONTENT)}
                    />
                  </div>
                {/if}
              </div>
            {:else}
              <Dropzone on:file={uploadFile(IMG_TYPES.CONTENT)} />
            {/if}
          </FormItem>
        </div>
      </div>
      <div class="grid grid-cols-1 text-left">
        <FormItem
          title="Upload video experience information"
          text="text-center"
        >
          {#if imagePreview[IMG_TYPES.VIDEO] || imagePercent[IMG_TYPES.VIDEO]}
            <div class="text-black">
              {#if imagePercent[IMG_TYPES.VIDEO] && imagePercent[IMG_TYPES.VIDEO] < 100}
                Loading...
              {:else if imagePercent[IMG_TYPES.VIDEO] && imagePercent[IMG_TYPES.VIDEO] === 100}
                <div class="w-1/2">
                  <ArtworkMedia
                    {artwork}
                    preview={imagePreview[IMG_TYPES.VIDEO]}
                    on:cancel={cancelPreview(IMG_TYPES.VIDEO)}
                  />
                </div>
              {/if}
            </div>
          {:else}
            <Dropzone on:file={uploadFile(IMG_TYPES.VIDEO)} />
          {/if}
        </FormItem>
      </div>
      <!--        <div>-->
      <!--          <FormItem title="Upload content">-->
      <!--            <Dropzone on:file={uploadFile}/>-->
      <!--          </FormItem>-->
      <!--        </div>-->
      <!--        <div>-->
      <!--          <FormItem title="Upload Video Experience Information">-->
      <!--            <Dropzone on:file={uploadFile}/>-->
      <!--          </FormItem>-->
      <!--        </div>-->
      <div class="flex flex-wrap flex-col-reverse lg:flex-row">
        <div class="w-full">
          <div class:invisible={!loading}>
            <ProgressLinear />
          </div>
          <div class:invisible={loading}>
            <Form bind:artwork on:submit={submit} />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    width: 100% !important;
    min-height: 100vh;
    margin: 0;
    max-width: 100%;
  }

  .submitArtwork {
    box-shadow: 6px 5px 12px 2px #ccc;
  }

  @media only screen and (max-width: 1023px) {
    .container {
      background: none;
    }
  }

  h2 {
    font-family: "Zen Dots", cursive;
    font-size: 2em;
    line-height: 1.25em;
  }
</style>
