<script>
  import { onMount, onDestroy } from "svelte";
  import { format, parseISO } from "date-fns";
  import { api } from "$lib/api";
  import { ToggleSwitch } from "$comp";
  import { asset, assets, user, token } from "$lib/store";
  import { assetLabel, val, units } from "$lib/utils";

  let show = false;

  let txns = [];
  let getTransactions = () =>
    $token &&
    api
      .auth(`Bearer ${$token}`)
      .url("/transactions")
      .get()
      .json((data) => {
        txns = data.transactions.filter(
          (t) => t.type === "withdrawal" || t.type === "deposit"
        );

        $assets = txns
          .map(({ asset }) => ({ name: assetLabel(asset), asset }))
          .sort((a, b) => a.name.localeCompare(b.name))
          .filter((a, i, r) => a && (!i || a.asset != r[i - 1].asset));
      });

  let poll;
  let pollTransactions = async () => {
    await getTransactions();
    poll = setTimeout(pollTransactions, 5000);
  };

  onMount(pollTransactions);
  onDestroy(() => clearTimeout(poll));

  $: txAssets = (tx) => [
    ...new Set(
      tx.vout.filter((o) => !show || o.asset === $asset).map((o) => o.asset)
    ),
  ];
</script>

<div class="mb-10 md:mb-20 border rounded overflow-auto h-96 px-5 sm:px-0">
  {#if !txns.length}
    <p class="text-center mt-10 text-white text-lg">No transactions yet.</p>
  {/if}
  {#if txns.length}
    <div class="text-white my-7 flex px-6">
      <div class="flex-1">Show all history</div>
      <ToggleSwitch
        id="toggle"
        label={`Show only ${assetLabel($asset)}`}
        on:change={(e) => {
          show = !show;
        }}
      />
    </div>

    {#each txns as tx}
      {#if !show || tx.asset === $asset}
        <a href={`/tx/${tx.id}`}>
          <div class="text-white w-full mb-4 px-6">
            <div class="flex">
              <div class="flex-grow text-sm text-white">
                {format(parseISO(tx.created_at), "MMM do, yyyy")}
              </div>
              <div
                class:pending={!tx.confirmed}
                class:text-secondary={tx.confirmed && tx.amount > 0}
              >
                {tx.amount > 0 ? "+" : tx.amount < 0 ? "-" : ""}{val(
                  tx.asset,
                  Math.abs(tx.amount)
                )}
              </div>
            </div>

            <div class="">{assetLabel(tx.asset)}</div>
          </div>
        </a>
      {/if}
    {/each}
  {/if}
</div>

<style>
  .border {
    border: 1px solid grey;
  }
  .pending {
    @apply text-orange-400;
  }
</style>
