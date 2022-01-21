<script>
  import { createEventDispatcher } from "svelte";
  import Fa from "svelte-fa";
  import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

  const dispatch = createEventDispatcher();

  export let title = "PNG, GIF, MP4. Max 100mb.";
  export let style = "box";

  let fileInput;
  let highlight;

  let drop = (e) => {
    stop(e);
    let dt = e.dataTransfer;
    let files = dt.files;
    dispatch("file", dt.files[0]);
  };

  let start = (e) => {
    e.preventDefault();
    highlight = true;
  };

  let stop = (e) => {
    e.preventDefault();
    highlight = false;
  };

  let open = (e) => {
    fileInput.click();
  };

  let handle = (e) => {
    dispatch("file", { file: e.target.files[0] });
  };
</script>

{#if style === "box"}
  <div
    id="drop-area"
    on:click={open}
    on:dragenter={start}
    on:dragover={start}
    on:dragleave={stop}
    on:focus={start}
    on:mouseover={start}
    on:blur={stop}
    on:mouseout={stop}
    on:drop={drop}
    class:highlight
  >
    <form class="text-center py-6 px-30">
      <div class="flex justify-center flex-col align-center h-full">
        <span class="uppercase text-gray-400">{title}</span>
        <span class="mx-auto text-sm m-2 text-center">
          <button
            type="button"
            name="button"
            class="text-gray-300 bg-black rounded-full py-2 px-6"
            >Choose file</button
          >
        </span>
      </div>
      <input
        bind:this={fileInput}
        type="file"
        id="fileElem"
        multiple
        accept="image/*,video/*"
        on:change={handle}
      />
    </form>
  </div>
{:else}
  <a
    href="."
    on:click|preventDefault={open}
    class="secondary-color cursor-pointer"
  >
    <div class="flex">
      <div>{title}</div>
      <div class="ml-1 my-auto">
        <Fa icon={faCloudUploadAlt} />
      </div>
    </div>
  </a>
  <form class="text-center invisible">
    <div class="flex justify-center flex-col align-center h-full">
      <span class="uppercase">{title}</span>
      <Fa icon={faCloudUploadAlt} />
    </div>
    <input
      bind:this={fileInput}
      type="file"
      id="fileElem"
      multiple
      accept="image/*,video/*"
      on:change={handle}
    />
  </form>
{/if}

<style>
  #fileElem {
    position: fixed;
    top: -100em;
  }

  #drop-area {
    cursor: pointer;
    border: 2px solid lightgray;
    border-radius: 10px;
    width: 80%;
    max-width: 350px;
    max-height: 350px;
    margin: 50px auto;
    margin-top: 30px;
  }

  #drop-area.highlight {
    border-color: black;
  }

  #fileElem {
    position: fixed;
    top: -100em;
  }

  @media only screen and (max-width: 800px) {
    #drop-area {
      width: 100%;
      max-width: 100%;
      margin: 10px 0 25px 0;
    }
  }
</style>
