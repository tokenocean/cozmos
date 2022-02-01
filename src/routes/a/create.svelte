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
  import Card from "$styleguide/components/Card.svelte";
  import Core from "$lib/lnft-core";
  import { page } from "$app/stores";
  import { onMount, tick } from "svelte";
  import { prompt, token, psbt, fee, password, sighash } from "$lib/store";
  import { ProgressLinear, PhotoGallery, ThankYou } from "$comp";
  import {
    create,
    updateArtwork,
    updateArtworkWithRoyaltyRecipients,
  } from "$queries/artworks";
  import { requirePassword } from "$lib/auth";
  import {
    broadcast,
    cancelSwap,
    createIssuance,
    createRelease,
    createSwap,
    keypair,
    parseAsset,
    requestSignature,
    sendToMultisig,
    sign,
    signAndBroadcast,
    signOver,
  } from "$lib/wallet";
  import reverse from "buffer-reverse";
  import { ArtworkMedia, RoyaltyRecipientList } from "$comp";
  import branding from "$lib/branding";

  import Form from "./_form.svelte";
  import Issuing from "./_issuing.svelte";

  import { Psbt } from "liquidjs-lib";
  import { api, query } from "$lib/api";
  import { createTransaction } from "$queries/transactions";
  import {
    format,
    addDays,
    compareAsc,
    isWithinInterval,
    parse,
    parseISO,
    addMinutes,
  } from "date-fns";
  import {
    btc,
    fade,
    kebab,
    goto,
    err,
    info,
    units,
    sats,
    val,
    tickers,
    assetLabel,
    royaltyRecipientSystemType,
  } from "$lib/utils";
  import Select from "svelte-select";

  export let default_royalty_recipients, user;
  let artwork = {
    asking_asset: btc,
    title: "",
    description: "",
    main: [],
    ticker: "",
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

  let list_price,
    loading,
    input,
    initialized,
    reserve_price,
    royalty_value,
    start,
    end,
    auction_enabled,
    auction_underway,
    multi_royalty_recipients_enabled,
    royalty_recipients;

  let files = [];

  if (!artwork.asking_asset) artwork.asking_asset = btc;
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

  if (!list_price && artwork.list_price)
    list_price = val(artwork.asking_asset, artwork.list_price);
  if (!royalty_value)
    royalty_value = royalty_recipients.reduce(
      (a, b) => a + (b["amount"] || 0),
      0
    );
  multi_royalty_recipients_enabled = !!royalty_value;
  if (!reserve_price && artwork.reserve_price)
    reserve_price = val(artwork.asking_asset, artwork.reserve_price);

  const spendPreviousSwap = async () => {
    if (
      !list_price ||
      royalty_value ||
      artwork.auction_end ||
      parseInt(artwork.list_price || 0) ===
        sats(artwork.asking_asset, list_price)
    )
      return true;

    await requirePassword();

    if (artwork.list_price_tx) {
      $psbt = await cancelSwap(artwork, 500);

      if (artwork.has_royalty || artwork.auction_end) {
        $psbt = await requestSignature($psbt);
      }
      try {
        await signAndBroadcast();
        await query(createTransaction, {
          transaction: {
            amount: artwork.list_price,
            artwork_id: artwork.id,
            asset: artwork.asking_asset,
            hash: $psbt.extractTransaction().getId(),
            psbt: $psbt.toBase64(),
            type: "cancel",
          },
        });

        stale = true;
      } catch (e) {
        if (e.message.includes("already"))
          throw new Error(
            "Please wait a block before changing the listing price"
          );
        else throw e;
      }
    }
  };

  const setupSwaps = async () => {
    if (
      !list_price ||
      (!stale &&
        parseInt(artwork.list_price || 0) ===
          sats(artwork.asking_asset, list_price))
    )
      return true;

    let tx;
    if (stale) tx = $psbt.extractTransaction();
    await requirePassword();

    $psbt = await createSwap(
      artwork,
      sats(artwork.asking_asset, list_price),
      tx
    );

    await sign(0x83);

    artwork.list_price_tx = $psbt.toBase64();

    await query(createTransaction, {
      transaction: {
        amount: sats(artwork.asking_asset, list_price),
        artwork_id: artwork.id,
        asset: artwork.asking_asset,
        hash: $psbt.__CACHE.__TX.getId(),
        psbt: $psbt.toBase64(),
        type: "listing",
      },
    });
  };

  let setupAuction = async () => {
    let { auction_start: start, auction_end: end } = artwork;

    if (compareAsc(parseISO(start), new Date()) < 1)
      throw new Error("Start date can't be in the past");

    if (compareAsc(parseISO(start), parseISO(end)) > 0)
      throw new Error("Start date must precede end date");

    if (compareAsc(parseISO(artwork.auction_end), new Date()) < 1) {
      await requirePassword();

      let base64, tx;
      if (royalty_value) {
        tx = await signOver(artwork, tx);
        artwork.auction_tx = $psbt.toBase64();
      } else {
        $psbt = await sendToMultisig(artwork);
        $psbt = await signAndBroadcast();
        base64 = $psbt.toBase64();
        tx = $psbt.extractTransaction();

        tx = await signOver(artwork, tx);
        artwork.auction_tx = $psbt.toBase64();

        artwork.auction_release_tx = (
          await createRelease(artwork, tx)
        ).toBase64();
      }

      await query(createTransaction, {
        transaction: {
          amount: 1,
          artwork_id: artwork.id,
          asset: artwork.asking_asset,
          hash: tx.getId(),
          psbt: $psbt.toBase64(),
          type: "auction",
        },
      });

      if (base64) $psbt = Psbt.fromBase64(base64);
    }
  };

  let stale;
  let setupRoyalty = async () => {
    if (artwork.has_royalty || !royalty_value) return true;

    if (!artwork.auction_end) {
      await requirePassword();
      $psbt = await sendToMultisig(artwork);
      await signAndBroadcast();
    }

    await query(createTransaction, {
      transaction: {
        amount: 1,
        artwork_id: artwork.id,
        asset: artwork.asking_asset,
        hash: $psbt.extractTransaction().getId(),
        psbt: $psbt.toBase64(),
        type: "royalty",
      },
    });

    stale = true;

    info("Royalties activated!");
  };

  let tags = [];
  let video;
  let hidden = true;
  $: preview = files.find((f) => f.type === "main")?.preview;

  let hash, tx, listingType;

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

      let auction_start, auction_end;
      if (listingType === "AUCTION") {
        auction_start = start;
        auction_end = end;
      }

      artwork = {
        ...artwork,
        auction_start,
        auction_end,
        editions: 1,
        list_price: sats(artwork.asking_asset, list_price),
        reserve_price: sats(artwork.asking_asset, reserve_price),
      };

      let { id, asset } = await core.createArtwork({
        artwork,
        generateRandomTickers: true,
      });

      artwork.id = id;
      artwork.asset = asset;

      await setupAuction();
      await spendPreviousSwap();
      await setupRoyalty();
      await setupSwaps();

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        await core.createFile(id, file);
      }

      let {
        asset: a,
        ticker,
        slug,
        royalty_recipients,
        owner,
        artist,
        main,
        cover,
        thumb,
        video,
        gallery,
        tags,
        ...stripped
      } = artwork;

      query(updateArtworkWithRoyaltyRecipients, {
        artwork: stripped,
        id,
        royaltyRecipients: royalty_value
          ? royalty_recipients.map((item) => {
              delete item.id;
              item.artwork_id = id;
              item.asking_asset = artwork.asking_asset;
              return item;
            })
          : [],
      }).catch(err);

      api.url("/asset/register").post({ asset }).json().catch(console.log);

      showThanks();
    } catch (e) {
      err(e);
      loading = false;
      $prompt = undefined;
    }
  }

  let close = () => {
    goto("/#market");
  };
</script>

<div class="container mx-auto p-6 md:p-20">
  <div class="flex w-full mx-auto bg-gray-100 submitArtwork mb-4 md:mb-0">
    <div
      class="absolute right-2 md:right-16 rounded-full border-black border-l border-t w-8 h-8 -mt-4 z-50 bg-black text-4xl text-center text-white cursor-pointer"
      on:click={close}
    >
      <div class="-mt-2">&times;</div>
    </div>
    <div class="hidden lg:flex lg:flex-col md:w-[500px]">
      <div
        class="flex-grow-1 h-full bg-black"
        style="background-image: url('/stars.png')"
      >
        <h2 class="text-white p-14">Preview experience</h2>
        <div
          class="w-2/3 mx-auto bg-white rounded-3xl sticky top-64 mb-20 nopointer"
        >
          <Card {artwork} {preview} />
        </div>
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

      <div class="flex flex-wrap flex-col-reverse lg:flex-row">
        <div class="w-full">
          <div class:invisible={!loading}>
            <ProgressLinear />
          </div>
          <div class:invisible={loading}>
            <div
              class="block lg:hidden w-10/12 mx-auto md:w-6/12 bg-white rounded-3xl nopointer mb-5"
            >
              <Card {artwork} {preview} />
            </div>
            <Form
              bind:listingType
              bind:artwork
              bind:list_price
              bind:reserve_price
              bind:files
              bind:start
              bind:end
              on:submit={submit}
            />
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
