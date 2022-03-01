/**
 * The idea behind LNFT CORE is to group all necessary methods within a one class
 * to easily use any backend / liquid methods on any page or when develop new features
 *
 * Feel free to extend this file by any:
 * - Request to the backend
 * - Getters from the backend
 * - Operations with a liquid
 */

import { v4 } from "uuid";
import { query, hasura } from "$lib/api";
import { tick } from "svelte";
import { get } from "svelte/store";
import {
  edition as artworkCreateEditionInProgress,
  psbt,
  user,
  token,
} from "$lib/store";
import {
  create,
  createComment,
  updateArtworkWithRoyaltyRecipients,
} from "$queries/artworks";
import { createTransaction } from "$queries/transactions";
import { btc, dev, err, info, kebab } from "$lib/utils";
import {
  createSwap,
  cancelSwap,
  createIssuance,
  sign,
  broadcast,
  parseAsset,
  signAndBroadcast,
  sendToMultisig,
} from "$lib/wallet";
import branding from "$lib/branding";
import {
  format,
  addDays,
  compareAsc,
  isWithinInterval,
  parse,
  parseISO,
  addMinutes,
} from "date-fns";

export default class Core {
  constructor() {
    this.token = null;
    this.user = null;
    this.psbt = null;

    token.subscribe((token) => {
      this.token = token;
    });

    user.subscribe((user) => {
      this.user = user;
    });

    psbt.subscribe((psbt) => {
      this.psbt = psbt;
    });
  }

  /**
   * Generates specific count of free tickers with a check within database
   * @param {number} count - count of tickers
   * @returns {Promise<*[]>} - returns array of tickers
   */
  async generateFreeTickers({ count = 1 }) {
    const randomTicker = () => {
      let a = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      let ticker = "";
      for (let j = 0; j < 5; j++) {
        const random = Math.floor(Math.random() * (a.length - 1));
        ticker = `${ticker}${a[random]}`;
      }
      return ticker;
    };

    let tickers = [];
    for (let i = 0; i < count; i++) {
      let randTicker = randomTicker();

      // check that ticker is unique in our tickers array
      while (tickers.indexOf(randTicker) !== -1) {
        randTicker = randomTicker();
      }

      tickers.push(randTicker);
    }

    let tickersOK = false;

    // if at least one ticker exist in database we need to generate new one
    while (!tickersOK) {
      const result = await this.checkTickers({
        tickers,
      });

      if (result.success) tickersOK = true;

      if (result.error && result.tickersUnavailable.length) {
        result.tickersUnavailable.forEach((ticker) => {
          const index = tickers.indexOf(ticker);
          tickers[index] = randomTicker();
        });
      }
    }

    return tickers;
  }

  /**
   * Generates specific count of free tickers based on ticker provided by user
   * Mostly used when user creates multiple editions of Artwork with specified ticker
   * @param {number} count
   * @param {string} ticker
   * @returns {Promise<*[string]>}
   */
  async generateTickersBasedOnMainTicker({ count, ticker }) {
    let tickers = [];

    let a = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let b = [];
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a.length; j++) {
        b.push(a[i] + a[j]);
      }
    }
    let c = [...a, ...b];

    for (let edition = 1; edition <= count; edition++) {
      if (edition > 1)
        ticker = ticker.substr(0, 3) + c[c.indexOf(ticker.substr(3)) + 1];
      tickers.push(ticker.toUpperCase());
    }

    return tickers;
  }

  /**
   * Checks that tickers are free to use in database
   * @param {string[]} tickers
   * @returns {Promise<{error: string, tickersUnavailable: (string|*|string)[]}|{success: boolean}>}
   */
  async checkTickers({ tickers }) {
    let { data } = await hasura
      .auth(`Bearer ${this.token}`)
      .post({
        query: `query { artworks(where: { ticker: { _in: ${JSON.stringify(
          tickers
        )} }}) { ticker }}`,
      })
      .json();

    if (data.artworks && data.artworks.length)
      return {
        error: `Ticker(s) not available: ${data.artworks
          .map((a) => a.ticker)
          .join(", ")}`,
        tickersUnavailable: data.artworks.map((a) => a.ticker),
      };

    return { success: true };
  }

  /**
   * Issues Liquid Token that represents NFT version of Artwork
   * @param artwork - Artwork Object
   * @returns {Promise<{contract: string, asset, hash: string}>}
   */
  async issueToken({ artwork }) {
    let contract;
    let tx;

    let domain =
      this.user.username === branding.superUserName
        ? branding.urls.base
        : `${this.user.username.toLowerCase()}.${branding.urls.base}`;

    try {
      contract = await createIssuance(artwork, domain, tx);

      await sign();
      await broadcast(true);
      await tick();
    } catch (e) {
      throw new Error("Issuance failed: " + e.message);
    }

    tx = this.psbt.extractTransaction();
    let asset = parseAsset(
      tx.outs.find((o) => parseAsset(o.asset) !== btc).asset
    );

    let hash = tx.getId();

    return {
      contract: JSON.stringify(contract),
      hash: hash,
      asset: asset,
    };
  }

  async createComment(artwork_id, comment) {
    let variables = {
      comment: { artwork_id, comment },
    };

    let result = await hasura
      .auth(`Bearer ${this.token}`)
      .post({
        query: createComment,
        variables,
      })
      .json();

    if (result.error) throw new Error(result.error.message);
    if (result.errors) {
      const messages = result.errors.map((error) => error.message).join("\n");
      throw new Error(messages);
    }
  }

  async createFile(artwork_id, file) {
    let strippedDown = { ...file, artwork_id };
    delete strippedDown.file;
    delete strippedDown.preview;
    delete strippedDown.id;

    let result = await query(
      `mutation ($file: files_insert_input!) {
      insert_files_one(object: $file) {
        id
      }
    }`,
      { file: strippedDown }
    );
  }

  /**
   * Creates a new artwork
   * @param artwork
   * @param generateRandomTickers - in case if user doesn't specify the Ticker - we should generate random tickers,
   * false by default
   * @returns {Promise<{filetype}|{filename}|*>}
   */
  async createArtwork({ artwork, generateRandomTickers = false }) {
    // check that artwork match expectations

    if (!dev) {
      if (!artwork.title) throw new Error("Please enter a title");
      if (!artwork.description) throw new Error("Description is required");
      if (!artwork.package_content)
        throw new Error("Enter your package content");
      if (!artwork.main.length) throw new Error("NFT image required");
    }

    if (artwork.reserve_price && !artwork.auction_start)
      throw new Error("Auction start date required");
    if (artwork.reserve_price && !artwork.auction_end)
      throw new Error("Auction end date required");

    let { ticker } = artwork;
    let tickers = [];

    // if artwork has multiple editions - generate the array of tickers for each artwork
    if (generateRandomTickers) {
      tickers = await this.generateFreeTickers({ count: artwork.editions });
    } else {
      tickers = await this.generateTickersBasedOnMainTicker({
        count: artwork.editions,
        ticker,
      });
      const result = await this.checkTickers({ tickers: tickers });

      if (result.error) throw new Error(result.error);
    }

    // create artworks & push to blockchain/database
    for (let edition = 1; edition <= artwork.editions; edition++) {
      // write to store the number of current edition in progress
      // this will be used in Issuing popup
      artworkCreateEditionInProgress.set(edition);

      artwork.ticker = tickers[edition - 1].toUpperCase();
      if (edition > 1) {
        await new Promise((r) => setTimeout(r, 5000));
      }

      artwork.id = v4();
      artwork.edition = edition;
      artwork.slug = kebab(artwork.title || "untitled");

      if (edition > 1) artwork.slug += "-" + edition;
      artwork.slug += "-" + artwork.id.substr(0, 5);

      let tags = artwork.tags.map(({ tag }) => ({
        tag,
        artwork_id: artwork.id,
      }));

      let { hash, contract, asset } = await this.issueToken({ artwork });

      artwork.asset = asset;

      let { id, title, description, ticker, slug, editions, package_content } =
        artwork;

      let variables = {
        artwork: {
          id,
          title,
          description,
          ticker,
          asset,
          slug,
          edition,
          editions,
          package_content,
        },
        transaction: {
          artwork_id: id,
          type: "creation",
          hash,
          contract,
          asset,
          amount: 1,
          psbt: this.psbt.toBase64(),
        },
        tags,
      };

      let result = await hasura
        .auth(`Bearer ${this.token}`)
        .post({
          query: create,
          variables,
        })
        .json();

      if (result.error) throw new Error(result.error.message);
      if (result.errors) {
        const messages = result.errors.map((error) => error.message).join("\n");
        throw new Error(messages);
      }
    }

    return artwork;
  }

  async setupAuction(artwork, current) {
    let { auction_start: start, auction_end: end } = artwork;

    if (compareAsc(parseISO(start), new Date()) < 1)
      throw new Error("Start date can't be in the past");

    if (compareAsc(parseISO(start), parseISO(end)) > 0)
      throw new Error("Start date must precede end date");

    if (compareAsc(parseISO(artwork.auction_end), new Date()) < 1) {
      let base64, tx;
      if (current?.royalty_recipients.length) {
        tx = await signOver(artwork, tx);
        artwork.auction_tx = get(psbt).toBase64();
      } else {
        psbt.set(await sendToMultisig(artwork));
        psbt.set(await signAndBroadcast());
        base64 = get(psbt).toBase64();
        tx = get(psbt).extractTransaction();

        tx = await signOver(artwork, tx);
        artwork.auction_tx = get(psbt).toBase64();

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
          psbt: get(psbt).toBase64(),
          type: "auction",
        },
      });

      if (base64) psbt.set(Psbt.fromBase64(base64));
    }
  }

  async setupRoyalty(artwork, current) {
    if (current?.has_royalty || !artwork.royalty_recipients.length) return true;

    if (!artwork.auction_end) {
      psbt.set(await sendToMultisig(artwork));
      await signAndBroadcast();
    }

    await query(createTransaction, {
      transaction: {
        amount: 1,
        artwork_id: artwork.id,
        asset: artwork.asking_asset,
        hash: get(psbt).extractTransaction().getId(),
        psbt: get(psbt).toBase64(),
        type: "royalty",
      },
    });

    artwork.stale = true;

    info("Royalties activated!");
  }

  async setupSwaps(artwork, current) {
    if (
      !artwork.list_price ||
      (!artwork.stale &&
        parseInt(current?.list_price || 0) === artwork.list_price)
    )
      return true;

    let tx = get(psbt).extractTransaction();
    psbt.set(await createSwap(artwork, tx));

    await sign(0x83);

    artwork.list_price_tx = get(psbt).toBase64();

    await query(createTransaction, {
      transaction: {
        amount: artwork.list_price,
        artwork_id: artwork.id,
        asset: artwork.asking_asset,
        hash: get(psbt).__CACHE.__TX.getId(),
        psbt: get(psbt).toBase64(),
        type: "listing",
      },
    });
  }

  async spendPreviousSwap(artwork, current) {
    console.log(current);
    if (
      !(current && current.list_price && current.list_price_tx) ||
      artwork.auction_end ||
      parseInt(current?.list_price || 0) === artwork.list_price
    )
      return true;

    psbt.set(await cancelSwap(artwork, 500));

    try {
      await signAndBroadcast();
      await query(createTransaction, {
        transaction: {
          amount: artwork.list_price,
          artwork_id: artwork.id,
          asset: artwork.asking_asset,
          hash: get(psbt).extractTransaction().getId(),
          psbt: get(psbt).toBase64(),
          type: "cancel",
        },
      });

      artwork.stale = true;
    } catch (e) {
      if (e.message.includes("already"))
        throw new Error(
          "Please wait a block before changing the listing price"
        );
      else throw e;
    }
  }

  async listArtwork(artwork, current, files) {
    await this.setupAuction(artwork, current);
    await this.spendPreviousSwap(artwork, current);
    await this.setupRoyalty(artwork, current);
    await this.setupSwaps(artwork, current);

    let { id } = artwork;

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      await this.createFile(id, file);
    }

    let {
      list_price,
      list_price_tx,
      asking_asset,
      reserve_price,
      auction_start,
      auction_end,
      royalty_recipients,
      auction_tx,
      auction_release_tx,
    } = artwork;

    query(updateArtworkWithRoyaltyRecipients, {
      artwork: {
        list_price,
        list_price_tx,
        reserve_price,
        auction_start,
        auction_end,
        asking_asset,
        auction_tx,
        auction_release_tx,
      },
      id,
      royaltyRecipients: royalty_recipients.map((item) => {
        delete item.id;
        item.artwork_id = id;
        item.asking_asset = artwork.asking_asset;
        return item;
      }),
    }).catch(err);
  }
}
