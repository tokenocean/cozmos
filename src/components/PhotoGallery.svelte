<svelte:options accessors={true} />

<script>
  import Fa from "svelte-fa";
  import {
    faTimes,
    faChevronRight,
    faChevronLeft,
  } from "@fortawesome/free-solid-svg-icons";

  export let images;

  let showPopup = false;

  let current;
  let popup = (img) => {
    current = img;
    showPopup = !showPopup;
  };
  let src = (img) =>
    img.preview || `/api/public/${img.hash}.${img.filetype.split("/")[1]}`;

  let slider;
</script>

{#if images.length}
  <div class="flex justify-center items-center">
    <button
      type="button"
      name="button"
      on:click={() => (slider.scrollLeft -= 200)}
      class="mx-2"
    >
      <Fa icon={faChevronLeft} /></button
    >
    <div
      class="flex flex-start items-center overflow-x-auto"
      bind:this={slider}
    >
      {#each images as img}
        <img
          src={src(img)}
          alt="Gallery"
          class="rounded h-48 mx-2 cursor-pointer"
          on:click={() => popup(img)}
        />
      {/each}
    </div>

    <button
      type="button"
      name="button"
      on:click={() => (slider.scrollLeft += 200)}
      class="mx-2"
    >
      <Fa icon={faChevronRight} /></button
    >
  </div>
  {#if showPopup}
    <div
      on:click={() => (showPopup = !showPopup)}
      class:showPopup
      class="popup"
    >
      <span class="closeButton"><Fa icon={faTimes} /></span>
      <img src={src(current)} alt="Gallery" class="rounded w-1/2" />
    </div>
  {/if}
{/if}

<style lang="scss">
  .popup {
    position: fixed;
    z-index: 900;
    width: 100%;
    height: 100vh;
    padding: 5px;
    text-align: center;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: white;
    scroll-behavior: contain;
    transform: scale(0);
  }

  .showPopup {
    display: flex !important;
    align-items: center;
    justify-content: center;
    animation: zoom 0.2s ease forwards;
  }

  .closeButton {
    position: absolute;
    top: 100px;
    right: 50px;
    width: 40px;
    height: 40px;
    border-radius: 100%;
    background: whitesmoke;
    padding: 11px 15px;
    cursor: pointer;
  }

  .popup :global(video) {
    width: 50%;
    height: auto !important;
    margin: 0 auto;
  }

  .popup :global(div) {
    width: 100%;
    height: auto;
  }
  .popup :global(img) {
    margin: 0 auto;
    height: 95vh;
    object-fit: contain !important;
    cursor: pointer;
  }

  @keyframes zoom {
    0% {
      transform: scale(0.6);
    }
    100% {
      transform: scale(1);
    }
  }

  @media only screen and (max-width: 1023px) {
    .closeButton {
      top: 70px;
      right: 20px;
    }
  }

  @media only screen and (max-width: 500px) {
    .popup :global(img),
    .popup :global(video) {
      height: auto;
      width: 100%;
    }
  }
</style>
