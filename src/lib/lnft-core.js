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
import { api, query, hasura } from "$lib/api";
import { tick } from "svelte";
import { get } from "svelte/store";
import {
  edition as artworkCreateEditionInProgress,
  psbt,
  user,
  token,
  txcache,
} from "$lib/store";
import {
  create,
  createComment,
  updateArtworkWithRoyaltyRecipients,
} from "$queries/artworks";
import { createTransaction } from "$queries/transactions";
import { btc, dev, err, info, kebab } from "$lib/utils";
import { Psbt } from "liquidjs-lib";
import {
  broadcast,
  createRelease,
  createSwap,
  cancelSwap,
  createIssuance,
  getInputs,
  sign,
  signOver,
  parseAsset,
  parseVal,
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
   * Issues Liquid Token that represents NFT version of Artwork
   * @param artwork - Artwork Object
   * @returns {Promise<{contract: string, asset, hash: string}>}
   */
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
   * @returns {Promise<{filetype}|{filename}|*>}
   */
  async createArtwork(artwork) {
    let transactions = [];
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

    let edition;

    let required = 0;
    let [inputs, total] = await getInputs();
    let issueToken = async () => {
      let contract, tx;

      let domain =
        this.user.username === branding.superUserName
          ? branding.urls.base
          : `${this.user.username.toLowerCase()}.${branding.urls.base}`;

      try {
        contract = await createIssuance(artwork, domain, tx);
        await sign(1, false);
        await tick();

        tx = get(psbt).extractTransaction();
        required += parseVal(tx.outs.find((o) => o.script.length === 0).value);
        get(txcache)[tx.getId()] = tx;
        inputs.unshift(tx);

        transactions.push({ contract, psbt: get(psbt).toBase64() });

        let asset = parseAsset(
          tx.outs.find((o) => parseAsset(o.asset) !== btc).asset
        );

        let hash = tx.getId();

        return {
          asset,
          contract: JSON.stringify(contract),
          hash,
        };
      } catch (e) {
        console.log(e);
        throw new Error("Issuance failed: " + e.message);
      }
    };

    for (edition = 1; edition <= artwork.editions; edition++) {
      await issueToken();
    }

    if (total < required)
      throw { message: "Insufficient funds", required, btc, total };

    let { id, asset, issuance, slug } = await api
      .url("/issue")
      .auth(`Bearer ${this.token}`)
      .post({
        artwork,
        transactions,
      })
      .json();

    artwork.slug = slug;
    artwork.id = id;
    artwork.asset = asset;

    return artwork;
  }

  async setupAuction(artwork, current) {
    let { auction_start: start, auction_end: end } = artwork;
    if (current || !(start && end)) return;

    if (compareAsc(parseISO(start), new Date()) < 1)
      throw new Error("Start date can't be in the past");

    if (compareAsc(parseISO(start), parseISO(end)) > 0)
      throw new Error("Start date must precede end date");

    let base64, tx;
    if (artwork.royalty_recipients.length) {
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
    artwork.has_royalty = true;

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
