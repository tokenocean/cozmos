<script>
  import { browser } from "$app/env";
  import Fa from "svelte-fa";
  import { faTimes } from "@fortawesome/free-solid-svg-icons";
  import { prompt, headerHeight } from "$lib/store";
  import { onMount, tick } from "svelte";
  let comp;
  let ok;

  $: hideControls = comp && comp.hide;

  let focus = (p) => browser && p && tick().then(() => ok && ok.focus());
  $: focus($prompt);

  let close = () => {
    comp.close && comp.close();
    $prompt = undefined;
  };

  function dark() {
    if ($prompt.dark) {
      return "bg-black border border-gray-500";
    }
  }

  let margin;
  let mql = browser && window.matchMedia("(max-width: 768px)");
  $: margin && mql.matches && (margin.style.marginTop = `${$headerHeight}px`);
</script>

{#if $prompt}
  <div class="fixed z-10 inset-0 overflow-y-auto" bind:this={margin}>
    <div
      class="dialog-container flex items-start md:items-center justify-center min-h-screen text-center"
    >
      <div
        class="hidden md:block fixed inset-0 transition-opacity"
        aria-hidden="true"
        on:click={close}
      >
        <div class="absolute inset-0 bg-gray-500 opacity-75" />
      </div>

      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true">&#8203;</span
      >
      <div
        class="dialog inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div class="{dark()} p-4" class:rainbow={$prompt.rainbow}>
          <div class="flow-root p-0 m-0">
            <div
              class="cursor-pointer float-right bg-black md:border border-white text-white p-2 m-0 w-8 rounded-full flex justify-center font-bold"
              on:click={close}
            >
              <img src="/svg_icons/x.png" alt="x" class="w-4" />
            </div>
          </div>
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <svelte:component
                this={$prompt.component}
                bind:this={comp}
                artwork={$prompt.artwork}
              />
            </div>
          </div>
        </div>
        {#if comp?.showButtons}
          <div class="border-t px-4 py-6 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              bind:this={ok}
              on:click={comp.submit}
              class="primary-btn mb-2 sm:mb-0 sm:ml-2"
            >
              Continue
            </button>
            <button
              type="button"
              class="secondary-btn"
              on:click={() => ($prompt = undefined)}
            >
              Cancel
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .rainbow {
    background: linear-gradient(
      135deg,
      #f28400 0%,
      #ef4baf 43%,
      #173af7 77%,
      #5fefbb 100%
    );
  }

  .secondary-btn {
    background-color: whitesmoke;
    border: 1px solid whitesmoke;
  }

  @media only screen and (max-width: 640px) {
    .dialog-container {
      padding: 0;
    }
    .dialog {
      width: 100%;
      padding: 0;
      margin: 0;
      border-radius: 0;
    }
    .dialog :global(input) {
      width: 100%;
    }
  }
</style>
