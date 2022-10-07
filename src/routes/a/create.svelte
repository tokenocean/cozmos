<script context="module">
  export async function load({ fetch, session }) {
    if (!(session && session.user))
      return {
        status: 302,
        redirect: "/login",
      };

    const { default_royalty_recipients } = await fetch(`/royalties.json`).then(
      (r) => r.json()
    );

    return {
      props: {
        default_royalty_recipients,
        user: session.user,
      },
    };
  }
</script>

<script>
  import * as animateScroll from "svelte-scrollto";
  import Card from "$styleguide/components/Card.svelte";
  import Core from "$lib/lnft-core";
  import { page } from "$app/stores";
  import { onMount, tick } from "svelte";
  import { prompt, token } from "$lib/store";
  import { ProgressLinear, PhotoGallery, ThankYou } from "$comp";
  import {
    create,
    updateArtwork,
    updateArtworkWithRoyaltyRecipients,
  } from "$queries/artworks";
  import { requirePassword } from "$lib/auth";
  import branding from "$lib/branding";

  import Form from "./_form.svelte";
  import Issuing from "./_issuing.svelte";

  import { api, query } from "$lib/api";
  import {
    format,
    addDays,
    compareAsc,
    isWithinInterval,
    parse,
    parseISO,
    addMinutes,
  } from "date-fns";
  import { btc, goto, err, royaltyRecipientSystemType } from "$lib/utils";
  import Select from "svelte-select";

  export let default_royalty_recipients, user;
  let artwork = {
    asking_asset: btc,
    title: "",
    description: "",
    main: [],
    package_content: "",
    asset: "",
    edition: 1,
    editions: 1,
    royalty_recipients: [],
    tags: [],
    owner: user,
    artist: user,
    list_price: null,
    reserve_price: null,
    auction_start: null,
    auction_end: null,
  };

  let loading,
    input,
    initialized,
    reserve_price,
    start,
    end,
    auction_enabled,
    auction_underway,
    royalty_recipients;

  let files = [];

  auction_enabled =
    auction_enabled ||
    compareAsc(parseISO(artwork.auction_end), new Date()) === 1;

  auction_underway =
    auction_enabled &&
    isWithinInterval(new Date(), {
      start,
      end,
    });

  if (default_royalty_recipients && default_royalty_recipients.length) {
    for (let index = 0; index < default_royalty_recipients.length; index++) {
      const { address, amount, name } = default_royalty_recipients[index];
      if (!artwork.royalty_recipients.find((e) => e.address === address)) {
        artwork.royalty_recipients.push({
          address,
          amount,
          name,
          type: royaltyRecipientSystemType,
        });
      }
    }
  }

  royalty_recipients = artwork.royalty_recipients;

  if (!reserve_price && artwork.reserve_price)
    reserve_price = val(artwork.asking_asset, artwork.reserve_price);

  let tags = [];
  let video;
  let hidden = true;
  $: preview = files.find((f) => f.type === "main")?.preview;

  let hash, tx;

  async function submit(e) {
    animateScroll.scrollTo(0);
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
      loading = true;

      let { artworks } = await core.createArtwork(artwork);

      for (artwork of artworks) {
        await core.listArtwork(artwork, null, files);
      }

      // api.url("/asset/register").post({ asset }).json().catch(console.log);

      await api.url("/mail-artwork-minted").auth(`Bearer ${$token}`).post({
        userId: user.id,
        artworkId: artworks[0].id,
      });

      showThanks();
    } catch (e) {
      err(e);
      loading = false;
      $prompt = undefined;
    }
  }

  let close = () => goto("/market");
</script>

<div class="container mx-auto p-6 md:p-20">
  <div class="flex w-full mx-auto md:bg-gray-100 submitArtwork mb-4 md:mb-0">
    <div
      class="absolute z-10 right-2 md:right-16 rounded-full border-black border-l border-t w-8 h-8 -mt-4 bg-black text-4xl text-center text-white cursor-pointer"
      on:click={close}
    >
      <div class="-mt-2">&times;</div>
    </div>
    <div class="hidden xl:flex xl:flex-col w-[550px]">
      <div
        class="flex-grow-1 h-full bg-black"
        style="background-image: url('/stars.png')"
      >
        <h2 class="text-white p-14">Preview experience</h2>
        <div
          class="w-full md:w-[85%] mx-auto bg-white rounded-3xl sticky top-32 mb-20 nopointer"
        >
          <Card {artwork} {preview} />
        </div>
      </div>
    </div>
    <div class="md:p-14 p-2">
      <div
        class="leading-normal w-full md:w-3/5 mx-auto text-center mb-4 md:mb-12"
      >
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

      <div class="flex flex-wrap flex-col-reverse lg:flex-row">
        <div class="w-full">
          <div class:invisible={!loading}>
            <ProgressLinear />
          </div>
          <div class:invisible={loading}>
            <div
              class="block xl:hidden w-10/12 mx-auto lg:w-6/12 bg-white rounded-3xl nopointer mb-8"
            >
              <Card {artwork} {preview} />
            </div>

            <Form bind:artwork bind:files on:submit={submit} />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .nopointer {
    pointer-events: none;
  }

  .container {
    width: 100% !important;
    min-height: 100vh;
    margin: 0;
    max-width: 100%;
    margin-top: 5rem;
  }

  @media only screen and (min-width: 640px) {
    .submitArtwork {
      box-shadow: 6px 5px 12px 2px #ccc;
    }
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
