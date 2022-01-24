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

  let input;
  let initialized;

  let loading;
  let list_price,
    royalty_value,
    start_date,
    end_date,
    start_time,
    end_time,
    auction_enabled,
    auction_underway,
    multi_royalty_recipients_enabled,
    royalty_recipients;

  let reserve_price;

  if (!artwork.asking_asset) artwork.asking_asset = btc;
  auction_enabled =
    auction_enabled ||
    compareAsc(parseISO(artwork.auction_end), new Date()) === 1;

  let start, end;
  if (artwork.auction_start) {
    start = parseISO(artwork.auction_start);
    start_date = format(start, "yyyy-MM-dd");
    start_time = format(start, "HH:mm");
  }

  if (artwork.auction_end) {
    end = parseISO(artwork.auction_end);
    end_date = format(end, "yyyy-MM-dd");
    end_time = format(end, "HH:mm");
  }

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
    if (!auction_enabled) return true;

    let start = parse(
      `${start_date} ${start_time}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );

    let end = parse(`${end_date} ${end_time}`, "yyyy-MM-dd HH:mm", new Date());

    if (compareAsc(start, new Date()) < 1)
      throw new Error("Start date can't be in the past");

    if (compareAsc(start, end) > 0)
      throw new Error("Start date must precede end date");

    if (
      !artwork.auction_end ||
      compareAsc(parseISO(artwork.auction_end), new Date()) < 1
    ) {
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

    artwork.auction_start = start;
    artwork.auction_end = end;
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

  let tags;
  let video;
  let hidden = true;
  $: preview = files.find((f) => f.type === "main")?.preview;

  let hash, tx;
  const issue = async (ticker) => {
    let contract;
    let domain =
      user.username === branding.superUserName
        ? branding.urls.base
        : `${user.username.toLowerCase()}.${branding.urls.base}`;

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
    if (!t || t.length < 3) t = "TIK";
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
    try {
    let { artworks } = await query(`query { artworks(where: { ticker: { _like: "${artwork.ticker.toUpperCase()}%" }}) { ticker }}`);

    if (artworks.length) {
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
    } catch(e) {
      err(e);
    }
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
      await issue();
      let strippedDown = { ...artwork };
      delete strippedDown.royalty_recipients;
      delete strippedDown.owner;
      delete strippedDown.artist;
      delete strippedDown.main;
      delete strippedDown.cover;
      delete strippedDown.thumb;
      delete strippedDown.video;
      delete strippedDown.gallery;

      console.log("STRIPPED", strippedDown.asset);
      let savedArtwork = await core.createArtwork({
        artwork: strippedDown,
        generateRandomTickers: true,
      });

      let { id } = savedArtwork;

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        await core.createFile(savedArtwork.id, file);
      }

      await setupAuction();
      await spendPreviousSwap();
      await setupRoyalty();
      await setupSwaps();

      let {
        asking_asset,
        asset,
        auction_end,
        auction_release_tx,
        auction_start,
        auction_tx,
        bid_increment,
        extension_interval,
        list_price_tx,
        max_extensions,
      } = artwork;

      if (!auction_start) auction_start = null;
      if (!auction_end) auction_end = null;

      query(updateArtworkWithRoyaltyRecipients, {
        artwork: {
          asking_asset,
          auction_end,
          auction_release_tx,
          auction_start,
          auction_tx,
          bid_increment,
          extension_interval,
          list_price: sats(artwork.asking_asset, list_price),
          list_price_tx,
          max_extensions,
          reserve_price: sats(artwork.asking_asset, reserve_price),
        },
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
    goto("/market");
  };
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
        <div
          class="w-2/3 mx-auto bg-gray-500 rounded-3xl sticky top-64 mb-20 nopointer"
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
            <Form bind:artwork bind:list_price bind:reserve_price bind:files on:submit={submit} />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .zero {
    z-index: -1;
  }

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
