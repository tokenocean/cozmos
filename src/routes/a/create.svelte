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
  import FileUpload from "$components/FileUpload.svelte";
  import Card from "$styleguide/components/Card.svelte";
  import Core from "$lib/lnft-core";
  import { page } from "$app/stores";
  import { query } from "$lib/api";
  import { onMount, tick } from "svelte";
  import { prompt, token, psbt, user } from "$lib/store";
  import { ProgressLinear, PhotoGallery, ThankYou } from "$comp";
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
  import Issuing from "./_issuing.svelte";

  let tags;
  let video;
  let hidden = true;
  let loading;
  $: preview = files.find((f) => f.type === "main")?.preview;

  const addFile = async ({ detail: file }) => {
    files = [...files, file];
    await tick();
    gallery.go(images.length);
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

    contract = await createIssuance(artwork, domain, tx);

    await sign();
    await broadcast(true);
    await tick();

    tx = $psbt.extractTransaction();
    artwork.asset = parseAsset(
      tx.outs.find((o) => parseAsset(o.asset) !== btc).asset
    );
    hash = tx.getId();

    return JSON.stringify(contract);
  };

  let files = [];

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
    mainfile: [],
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
      delete strippedDown.mainfile;

      let savedArtwork = await core.createArtwork({
        artwork: strippedDown,
        // for Cozmos client we should generate tickers automatically,
        // and check their availability
        generateRandomTickers: true,
      });

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        await core.createFile(savedArtwork.id, file);
      }

      showThanks();
    } catch (e) {
      err(e);
      loading = false;
      $prompt = undefined;
    }
  }

  let close = () => {
    goto("/market");
  };

  let gallery;

  $: images = files.filter((f) => f.type === "gallery");
</script>

<div class="container mx-auto p-6 md:p-20 md:pb-96">
  <div class="flex w-full mx-auto bg-gray-100 submitArtwork mb-4 md:mb-0">
    <div
      class="absolute right-2 md:right-16 rounded-full border-black border-l border-t w-8 h-8 -mt-4 z-50 bg-black text-4xl text-center text-white cursor-pointer"
      on:click={close}
    >
      <div class="-mt-2">&times;</div>
    </div>
    <div class="hidden md:flex md:flex-col md:w-1/3">
      <div
        class="flex-grow-1 h-full bg-black"
        style="background-image: url('/stars.png')"
      >
        <h2 class="text-white p-14">Preview experience</h2>
        {#if $user}
          <div
            class="w-2/3 mx-auto bg-gray-500 rounded-3xl sticky top-64 mb-20"
          >
            <Card {artwork} {preview} />
          </div>
        {/if}
      </div>
    </div>
    <div class="md:p-14 p-2">
      <div class="w-full md:w-3/5 mx-auto text-center mb-4 md:mb-12">
        <h2 class="my-4 md:my-0">Create Experience</h2>
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

      <div class="md:grid md:grid-cols-2 md:text-left md:p-4">
        <FileUpload
          {artwork}
          title="Upload NFT Image"
          type="main"
          limits="PNG, JPG, GIF, MP4, WEBP, MAX 10MB"
          on:upload={addFile}
        />
        <FileUpload
          {artwork}
          title="Upload Cover Image"
          type="cover"
          limits="PNG, JPG, WEBP, MAX 10MB"
          on:upload={addFile}
        />
        <FileUpload
          {artwork}
          title="Upload Video"
          type="video"
          limits="MP4, MAX 100MB"
          on:upload={addFile}
        />
        <FileUpload
          {artwork}
          title="Upload Card Thumbnail"
          type="thumb"
          limits="PNG, JPG, WEBP, MAX 10MB"
          on:upload={addFile}
        />
        <FileUpload
          {artwork}
          title="Upload Gallery Photo"
          type="gallery"
          limits="PNG, JPG, WEBP, MAX 10MB"
          on:upload={addFile}
          previewEnabled={false}
        />
        <div>
          <PhotoGallery {images} bind:this={gallery} />
        </div>
      </div>
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
