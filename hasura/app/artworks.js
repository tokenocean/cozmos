const { api, electrs, q } = require("./api");
const { broadcast } = require("./wallet");
const { Psbt } = require("liquidjs-lib");
const { compareAsc, parseISO } = require("date-fns");
const {
  acceptBid,
  cancelBid,
  createTransaction,
  getCurrentUser,
  getTransactionArtwork,
  getTransactionUser,
  setHeld,
  setOwner,
  setPsbt,
  setRelease,
} = require("./queries");

const crypto = require("crypto");
const wretch = require("wretch");
const { SERVER_URL } = process.env;

app.post("/cancel", auth, async (req, res) => {
  try {
    let { id } = req.body;

    let { transactions_by_pk } = await q(getTransactionUser, { id });

    let { data } = await api(req.headers)
      .post({ query: getCurrentUser })
      .json();
    let user = data.currentuser[0];

    if (transactions_by_pk.user_id !== user.id) return res.code(401).send();

    let { update_transactions_by_pk } = await q(cancelBid, { id });

    res.send({ data: { update_transactions_by_pk } });
  } catch (e) {
    console.log("problem cancelling bid", e);
    res.code(500).send(e.message);
  }
});

app.post("/transfer", auth, async (req, res) => {
  try {
    let { address, transaction } = req.body;
    await new Promise((r) => setTimeout(r, 2000));

    let utxos = await electrs.url(`/address/${address}/utxo`).get().json();

    if (utxos.find((tx) => tx.asset === transaction.asset)) {
      transaction.user_id = req.body.id;
      transaction.type = "receipt";

      await q(createTransaction, { transaction });
    }

    res.send({});
  } catch (e) {
    console.log("problem transferring artwork", e);
    res.code(500).send(e.message);
  }
});

app.post("/viewed", async (req, res) => {
  try {
    let { update_artworks_by_pk } = await q(updateViews, { id: req.body.id });
    let { asset, owner } = update_artworks_by_pk;
    let { address, multisig } = owner;

    let find = async (a) =>
      (await electrs.url(`/address/${a}/utxo`).get().json()).find(
        (tx) => tx.asset === asset
      );

    let held = null;
    if (await find(address)) held = "single";
    if (await find(multisig)) held = "multisig";

    await q(setHeld, { id: req.body.id, held });

    res.send({});
  } catch (e) {
    console.log(e);
    res.code(500).send(e.message);
  }
});

app.post("/claim", auth, async (req, res) => {
  try {
    let {
      artwork: { asset, id },
    } = req.body;

    let { data } = await api(req.headers)
      .post({ query: getCurrentUser })
      .json();
    let user = data.currentuser[0];

    let { address, multisig } = user;

    let utxos = [
      ...(await electrs.url(`/address/${address}/utxo`).get().json()),
      ...(await electrs.url(`/address/${multisig}/utxo`).get().json()),
    ];

    let held = !!utxos.find((tx) => tx.asset === asset);

    res.send(await q(setOwner, { id, owner_id: user.id }));
  } catch (e) {
    console.log(e);
    res.code(500).send(e.message);
  }
});

app.post("/transaction", auth, async (req, res) => {
  try {
    const { transaction } = req.body;

    let { artworks } = await q(getTransactionArtwork, {
      id: transaction.artwork_id,
    });
    let {
      auction_end,
      auction_start,
      owner,
      title,
      bid,
      slug,
    } = artworks[0];

    if (
      transaction.type === "bid" &&
      transaction.amount < bid.amount &&
      auction_end &&
      compareAsc(parseISO(auction_end), new Date()) > 0
    ) {
      throw new Error(`Minimum bid is ${(bid.amount + 1000) / 100000000}`);
    }

    let locals = {
      outbid: false,
      title,
      url: `${SERVER_URL}/a/${slug}`,
    };

    try {
      await mail.send({
        template: "notify-bid",
        locals,
        message: {
          to: owner.display_name,
        },
      });

      if (bid && bid.user) {
        locals.outbid = true;

        await mail.send({
          template: "notify-bid",
          locals,
          message: {
            to: bid.user.display_name,
          },
        });
      }
    } catch (err) {
      console.error("Unable to send email");
      console.error(err);
    }

    ({ data, errors } = await api(req.headers)
      .post({ query: createTransaction, variables: { transaction } })
      .json());

    if (errors) throw new Error(errors[0].message);

    res.send(data.insert_transactions_one);
  } catch (e) {
    console.log("problem creating transaction", e);
    res.code(500).send(e.message);
  }
});

app.post("/release/update", auth, async (req, res) => {
  try {
    res.send(await q(setRelease, req.body));
  } catch (e) {
    console.log("problem releasing from auction", e);
    res.code(500).send(e.message);
  }
});

app.post("/tx/update", auth, async (req, res) => {
  try {
    res.send(await q(setPsbt, req.body));
  } catch (e) {
    console.log("problem updating transaction", e);
    res.code(500).send(e.message);
  }
});

app.post("/accept", auth, async (req, res) => {
  try {
    await broadcast(Psbt.fromBase64(req.body.psbt));
    let { data } = await api(req.headers)
      .post({ query: acceptBid, variables: req.body })
      .json();
    res.send(data);
  } catch (e) {
    console.log(e);
    res.code(500).send(e.message);
  }
});
