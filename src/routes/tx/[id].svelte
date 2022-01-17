<script>
  import Fa from "svelte-fa";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import { page } from "$app/stores";
  import reverse from "buffer-reverse";
  import { onMount } from "svelte";
  import { electrs, hasura, pub } from "$lib/api";
  import { getTransaction } from "$queries/transactions";
  import { Psbt } from "liquidjs-lib";
  import { psbt, token } from "$lib/store";
  import { Transaction } from "$comp";
  import { getTx } from "$lib/wallet";
  import { err } from "$lib/utils";

  const { id } = $page.params;

  let tx;
  let done;

  onMount(async () => {
    try {
      let result = await pub($token)
        .post({
          query: getTransaction(id),
        })
        .json();

      if (result.errors) throw new Error(result.errors[0].message);

      let {
        data: {
          transactions_by_pk: { hash, psbt: p },
        },
      } = result;

      if (p) $psbt = Psbt.fromBase64(p);
      else if (!$psbt) {
        tx = await getTx(hash);
        p = new Psbt();

        for (let i = 0; i < tx.ins.length; i++) {
          p.addInput(tx.ins[i]);
        }

        tx.outs.map((output) => {
          p.addOutput(output);
        });

        $psbt = p;
      }

      done = true;
    } catch (e) {
      err(e);
    }
  });
</script>

<div
  class="container mx-auto p-10 mt-16 max-w-4xl bg-black text-white rounded-xl"
>
  <div class="mb-5">
    <a
      on:click|preventDefault={() => window.history.back()}
      href="/"
      class="text-black"
    >
      <div class="flex text-white">
        <Fa icon={faChevronLeft} class="my-auto mr-1" />
        <div>Back</div>
      </div>
    </a>
    <h3 class="py-4 text-white">Transaction details</h3>
  </div>
  {#if done && $psbt}
    <Transaction {tx} />
  {:else}Transaction not found{/if}
</div>

<style media="screen">
  .container {
    margin-top: 10rem;
    margin-bottom: 5rem;
    box-shadow: 15px 15px 15px grey;
  }
</style>
