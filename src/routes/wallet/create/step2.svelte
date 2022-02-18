<script>
  import Fa from "svelte-fa";
  import {
    faChevronLeft,
    faChevronRight,
  } from "@fortawesome/free-solid-svg-icons";
  import { page } from "$app/stores";
  import { user } from "$lib/store";
  import { getMnemonic } from "$lib/wallet";
  import { copy, goto } from "$lib/utils";
  import { requirePassword } from "$lib/auth";
  import Button from "$styleguide/components/Button.svelte";

  let mnemonic;
  let displayMnemonic = async () => {
    if (!$user) return;
    await requirePassword();
    mnemonic = getMnemonic();
  };
  let offset = 0;

  $: displayMnemonic($page, $user);
</script>

<div
  class="border border-transparent container md:bg-black rounded-xl p-10 drop md:text-white mt-20"
>
  {#if mnemonic}
    <p class="text-center">
      Write down the following 12 words in the correct order:
    </p>
    <div class="flex">
      <button
        on:click={() => {
          if (offset === 0) {
            offset = 6;
          } else if (offset === 6) {
            offset = 0;
          }
        }}
        class="pagination w-auto m-2"
        class:active={offset === 0}
        ><Fa icon={faChevronLeft} class="text-black md:text-white" /></button
      >
      <div class="mx-auto px-4 lg:px-20 xl:px-32 border-style rounded-xl mt-4">
        {#each mnemonic.split(" ").slice(offset, offset + 6) as word, i}
          <div class="text-xl text-center mx-4 my-2">
            <p class="word"><b>{i + 1 + offset}.</b> {word}</p>
          </div>
        {/each}
      </div>
      <button
        on:click={() => {
          if (offset === 0) {
            offset = 6;
          } else if (offset === 6) {
            offset = 0;
          }
        }}
        class="pagination w-auto m-2"
        class:active={offset === 6}
        ><Fa icon={faChevronRight} class="text-black md:text-white" /></button
      >
    </div>

    <div class="flex justify-center">
      <p class="my-4">
        <a href="/" on:click|preventDefault={() => copy(mnemonic)}
          >Copy to clipboard</a
        >
      </p>
    </div>
    <div class="flex justify-center text-center mt-5">
      <button
        on:click={() =>
          offset === 0 ? goto("/wallet/create/step1") : (offset -= 6)}
        class="w-2/4 m-2 rounded-lg border border-black md:border-white md:text-white"
        >Back</button
      >
      <Button
        primary
        on:click={() =>
          offset === 6 ? goto("/wallet/create/step3") : (offset += 6)}
        class="hidden md:block w-2/4 m-2">Next</Button
      >
      <Button
        on:click={() =>
          offset === 6 ? goto("/wallet/create/step3") : (offset += 6)}
        class="w-2/4 m-2 bg-black text-white font-bold block md:hidden"
        >Next</Button
      >
    </div>
  {/if}
</div>

<style>
  .pagination {
    color: lightgray;
    padding: 7px;
  }

  .word b {
    margin-right: 10px;
    font-size: 15px;
    color: black;
  }

  .border-style {
    border: 0.5px solid black;
  }

  @media (min-width: 768px) {
    .border {
      border: 1px solid grey;
    }
    .border-style {
      border: 0.5px solid grey;
    }
    .word b {
      color: gray;
    }
  }
</style>
