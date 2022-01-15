<script>
  import Fa from "svelte-fa";
  import { faTimes } from "@fortawesome/free-solid-svg-icons";
  import { Splide, SplideSlide } from "@splidejs/svelte-splide";

  export let artwork;

  let showPopup = false;
  let options = {
    type: "loop",
    perPage: 3,
    perMove: 1,
    autoplay: true,
    pauseOnHover: true,
    gap: "1rem",
    pagination: false,
    width: "100%",
  };
  let current;
  let popup = (img) => {
    current = img;
    showPopup = !showPopup;
  };
  let src = (img) => `/api/public/${img.hash}.${img.filetype.split("/")[1]}`;
</script>

<div class="text-2xl font-bold mt-12 mb-4">Gallery</div>
<Splide {options}>
  {#each artwork.gallery as img}
    <SplideSlide>
      <img src={src(img)} alt="Gallery" class="rounded" on:click={() => popup(img)} />
    </SplideSlide>
  {/each}
</Splide>

{#if showPopup}
  <div on:click={() => (showPopup = !showPopup)} class:showPopup class="popup">
    <span class="closeButton"><Fa icon={faTimes} /></span>
    <img src={src(current)} alt="Gallery" class="rounded w-1/2" />
  </div>
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
    top: 50px;
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
      top: 20px;
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
