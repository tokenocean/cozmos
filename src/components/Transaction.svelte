<script>
  import { tick } from "svelte";
  import Fa from "svelte-fa";
  import {
    faChevronDown,
    faChevronUp,
  } from "@fortawesome/free-solid-svg-icons";
  import { Avatar, ProgressLinear } from "$comp";
  import { addresses, psbt, user } from "$lib/store";
  import reverse from "buffer-reverse";
  import { electrs } from "$lib/api";
  import {
    getTx,
    getAddress,
    parseVal,
    parseAsset,
    broadcast,
    sign,
    requestSignature,
  } from "$lib/wallet";
  import { requirePassword } from "$lib/auth";
  import { Psbt, Transaction } from "liquidjs-lib";
  import {
    explorer,
    addressLabel,
    addressUser,
    artworkId,
    assetLabel,
    copy,
    ticker,
    val,
    btc,
    goto,
    info,
    err,
  } from "$lib/utils";

  export let summary;
  export let tx = undefined;
  export let debug = false;

  let ins, outs, totals, senders, recipients, showDetails, users, lock, pp, uu;
  let loading;
  $: init($psbt, $user, $addresses, tx);
  let retries = 0;
  let init = async (p, u) => {
    if (lock) return setTimeout(() => init(p, u), 50);
    lock = true;
    p = $psbt;
    u = $user;
    if (!p) return (lock = false);

    ins = [];
    outs = [];

    if (!tx) {
      try {
        tx = p.extractTransaction();
      } catch (e) {
        tx = p.data.globalMap.unsignedTx.tx;
      }
    }

    totals = {};
    senders = {};
    recipients = {};
    users = {};

    for (let i = 0; i < tx.ins.length; i++) {
      let { hash, index } = tx.ins[i];
      let txid = reverse(hash).toString("hex");
      let input = (await electrs.url(`/tx/${txid}`).get().json()).vout[index];
      input.spent = (
        await electrs.url(`/tx/${txid}/outspend/${index}`).get().json()
      ).spent;

      input.signed =
        p.data.inputs[i] &&
        (!!p.data.inputs[i].partialSig || !!p.data.inputs[i].finalScriptSig);
      input.pSig = p.data.inputs[i] && !!p.data.inputs[i].partialSig;
      input.txid = txid;
      input.index = index;

      ins = [...ins, input];

      let { asset, scriptpubkey_address: address } = input;
      let username = addressLabel(address);
      users[username] = addressUser(address);

      if (!totals[username]) totals[username] = {};
      if (!totals[username][asset]) totals[username][asset] = 0;
      totals[username][asset] += input.value;
      senders[username] = true;
    }

    for (let j = 0; j < tx.outs.length; j++) {
      let out = tx.outs[j];

      let address, asset, value;

      asset = parseAsset(out.asset);
      value = parseVal(out.value);

      try {
        address = getAddress(out);
      } catch (e) {
        if (!out.script.length) address = "Fee";
        else {
          outs = [
            ...outs,
            {
              value,
              asset,
              address: "",
            },
          ];
          continue;
        }
      }

      let username = addressLabel(address);
      users[username] = addressUser(address);

      if (!totals[username]) totals[username] = {};
      if (!totals[username][asset]) totals[username][asset] = 0;
      totals[username][asset] -= value;
      if (totals[username][asset] < 0) recipients[username] = true;

      outs = [
        ...outs,
        {
          value,
          asset,
          address,
        },
      ];
    }

    lock = false;
  };

  let clear = () => {
    base64 = undefined;
    $psbt = undefined;
    tx = undefined;
  };

  let parse = () => (base64 = x);

  let base64;
  let x;
  $: read(base64);
  let read = async (base64) => {
    if (base64) {
      tx = undefined;
      $psbt = Psbt.fromBase64(base64);
      await init($psbt, $user);
    }
  };

  let signTx = async () => {
    await requirePassword();
    $psbt = await sign();
    try {
      $psbt = await requestSignature($psbt);
    } catch (e) {
      console.log(`Couldn't get server signature: ${e.message}`);
    }
    info("Signed");
  };

  let broadcastTx = async () => {
    try {
      await broadcast(true);
    } catch (e) {
      err(e);
    }
  };
</script>

{#if debug}
  {#if tx}
    <div class="flex mb-8">
      <button on:click={clear} class="primary-btn mr-2">Clear</button>
      <button on:click={signTx} class="primary-btn mr-2">Sign</button>
      <button on:click={broadcastTx} class="primary-btn">Broadcast</button>
    </div>
  {:else}
    <textarea bind:value={x} class="w-full" rows={14} />
    <div class="flex">
      <button on:click={parse} class="primary-btn mr-2">Parse</button>
    </div>
  {/if}
{/if}

{#if $addresses && tx}
  <div class="w-full mx-auto">
    <div
      class="grid grid-cols-1 gap-4"
      class:sm:grid-cols-2={!summary}
      class:mt-10={summary}
    >
      <div>
        <div class="grid grid-cols-3 mb-4">
          <h4 class="mb-2 text-xs text-gray-400">Sending</h4>
          <h4 class="mb-2 text-xs text-gray-400 text-right">Amount</h4>
          <h4 class="mb-2 text-xs text-gray-400 text-right">Asset</h4>
          {#each Object.keys(totals) as username}
            {#if senders[username] && username !== "Fee"}
              {#each Object.keys(totals[username]) as asset}
                {#if totals[username][asset] > 0}
                  {#if users[username]}
                    <div class="my-auto flex">
                      <div class="flex">
                        {#if users[username]}
                          <Avatar user={users[username]} />
                        {:else}
                          <Avatar
                            src="QmcbyjMMT5fFtoiWRJiwV8xoiRWJpSRwC6qCFMqp7EXD4Z"
                          />
                        {/if}
                      </div>
                      <div class="my-auto ml-2">
                        <a href={`/${username.replace(" 2of2", "")}`}>
                          {username}
                        </a>
                      </div>
                    </div>
                  {:else}
                    <div>{username}</div>
                  {/if}
                  <div class="my-auto ml-auto">
                    {#if val(asset, Math.abs(totals[username][asset]))}
                      <div class="mr-1 ml-auto">
                        {parseFloat(
                          val(asset, Math.abs(totals[username][asset]))
                        ).toFixed(8)}
                      </div>
                    {/if}
                  </div>
                  <div class="my-auto text-right">
                    {assetLabel(asset)}
                  </div>
                {/if}
              {/each}
            {/if}
          {/each}
        </div>
      </div>

      <div>
        <div class="grid grid-cols-3 mb-4">
          <h4 class="mb-2 text-xs text-gray-400">Receiving</h4>
          <h4 class="mb-2 text-xs text-gray-400 text-right">Amount</h4>
          <h4 class="mb-2 text-xs text-gray-400 text-right">Asset</h4>
          {#each Object.keys(totals) as username}
            {#if recipients[username] && username !== "Fee"}
              {#each Object.keys(totals[username]) as asset}
                {#if totals[username][asset] < 0}
                  {#if users[username]}
                    <div class="my-auto flex">
                      <div class="flex">
                        {#if users[username]}
                          <Avatar user={users[username]} />
                        {:else}
                          <Avatar
                            src="QmcbyjMMT5fFtoiWRJiwV8xoiRWJpSRwC6qCFMqp7EXD4Z"
                          />
                        {/if}
                      </div>
                      <div class="my-auto ml-2">
                        <a href={`/${username.replace(" 2of2", "")}`}>
                          {username}
                        </a>
                      </div>
                    </div>
                  {:else}
                    <div>{username}</div>
                  {/if}
                  <div class="my-auto ml-auto">
                    <div class="mr-1 ml-auto">
                      {parseFloat(
                        val(asset, Math.abs(totals[username][asset]))
                      ).toFixed(8)}
                    </div>
                  </div>
                  <div class="my-auto text-right">
                    {assetLabel(asset)}
                  </div>
                {/if}
              {/each}
            {/if}
          {/each}
        </div>

        {#if totals["Fee"]}
          <div class="grid grid-cols-3 mb-4 w-full">
            <h4 class="my-auto text-xs text-gray-400">Fee</h4>
            <div class="my-auto ml-auto">
              {val(btc, Math.abs(totals["Fee"][btc]))}
            </div>
            <div class="ml-auto my-auto">L-BTC</div>
          </div>
        {/if}
      </div>
    </div>

    {#if showDetails}
      <div
        class="my-6 cursor-pointer"
        on:click={() => (showDetails = !showDetails)}
      >
        <button class="primary-btn w-full"> Hide details</button>
      </div>
    {:else}
      <div
        class="my-6 cursor-pointer"
        on:click={() => (showDetails = !showDetails)}
      >
        <button class="primary-btn w-full"> Show details </button>
      </div>
    {/if}

    {#if showDetails}
      <div class="text-sm break-all text-wrap">
        <div class="text-gray-400 text-xs">Transaction ID</div>
        <div class="mb-4 p-4">
          {#if ins.find((i) => !i.signed || i.pSig)}
            {tx.getId()}
          {:else}
            <a
              href={`${explorer}/tx/${tx.getId()}`}
              class="secondary-color"
              target="_blank"
            >
              {tx.getId()}
            </a>
          {/if}
        </div>

        <div class="flex mb-2">
          <div class="w-1/2">
            <div class="text-gray-400 text-xs">Size</div>
            <div class="p-4">{tx.virtualSize()} bytes</div>
          </div>
          <div class="w-1/2">
            <div class="text-gray-400 text-xs">Weight</div>
            <div class="p-4">{tx.weight()} vbytes</div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4" class:sm:grid-cols-2={!summary}>
          <div>
            <div class="text-gray-400 text-xs mb-2">Inputs</div>

            {#each ins as input, i}
              <div class="mb-2 p-4 border">
                <div class="ml-auto text-xs text-gray-400 text-right">{i}</div>

                <div class="mb-2 grid grid-cols-2">
                  {#if input.value}
                    <div>
                      <div class="text-gray-400 text-xs">Value</div>
                      {input.value}
                    </div>
                  {/if}
                  <div>
                    <div class="text-gray-400 text-xs">Status</div>
                    {input.signed
                      ? input.pSig
                        ? "Partially signed"
                        : "Fully signed"
                      : "Unsigned"}
                    /
                    {input.spent ? "Spent" : "Unspent"}
                  </div>
                </div>
                {#if input.asset}
                  <div class="mb-2">
                    <div class="text-gray-400 text-xs">Asset</div>
                    <a href={`${explorer}/asset/${input.asset}`}
                      >{input.asset}</a
                    >
                  </div>
                {/if}

                <div class="text-gray-400 text-xs">Address</div>
                <div class="mb-2">
                  <a href={`${explorer}/address/${input.scriptpubkey_address}`}
                    >{input.scriptpubkey_address}</a
                  >
                </div>
                <div class="mb-2">
                  <div class="text-gray-400 text-xs">Prevout</div>
                  <a href={`${explorer}/tx/${input.txid}?output:${input.index}`}
                    >{input.txid}:{input.index}</a
                  >
                </div>
              </div>
            {/each}
          </div>

          <div>
            <div class="text-gray-400 text-xs mb-2">Outputs</div>
            {#each outs as out, i}
              {#if out}
                <div class="mb-2 p-4 border">
                  <div class="ml-auto text-xs text-gray-400 text-right">
                    {i}
                  </div>
                  {#if out.value && out.asset}
                    <div class="mb-2">
                      <div class="text-gray-400 text-xs">Value</div>
                      {out.value}
                    </div>
                    <div class="mb-2">
                      <div class="text-gray-400 text-xs">Asset</div>
                      <a href={`${explorer}/asset/${out.asset}`}>{out.asset}</a>
                    </div>
                  {/if}
                  <div>
                    {#if out.address === "Fee"}
                      <div class="text-gray-400 text-xs">Fee</div>
                    {:else if out.value}
                      <div class="text-gray-400 text-xs">Address</div>
                      <a href={`${explorer}/address/${out.address}`}
                        >{out.address}</a
                      >
                    {:else}
                      <div class="text-gray-400 text-xs">OP Return</div>
                    {/if}
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <button
            class="primary-btn mb-2"
            on:click={() => copy($psbt.toBase64())}>Copy PSBT Base64</button
          >
          <button class="primary-btn mb-2" on:click={() => copy(tx.toHex())}
            >Copy Tx Hex</button
          >
        </div>
      </div>
    {/if}
  </div>
{:else if !debug}
  <ProgressLinear />
{/if}

<style>
  .primary-btn {
    @apply border border-pink-500;
  }
</style>
