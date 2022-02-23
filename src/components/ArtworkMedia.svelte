<script>
  import { onMount } from "svelte";
  import Fa from "svelte-fa";
  import {
    faVolumeUp,
    faVolumeMute,
    faTimes,
  } from "@fortawesome/free-solid-svg-icons";
  import { loaded } from "$lib/store";

  export let artwork;
  export let showDetails = false;
  export let thumb = true;
  export let preview = false;
  export let popup = false;
  export let cover = false;
  export let featured = false;
  export let popupImage = false;
  export let filetype = undefined;
  export let src = undefined;
  export let square = false;

  $: isVideo =
    filetype?.includes("video") ||
    (artwork?.main?.length &&
      artwork.main[0].filetype &&
      artwork.main[0].filetype.includes("video"));
  $: title = artwork?.title || "";

  let img, vid;
  $: path =
    src ||
    (artwork &&
      artwork.main &&
      artwork.main[0] &&
      (thumb
        ? `/api/public/${artwork.main[0].hash}.${
            artwork.main[0].filetype.split("/")[1]
          }`
        : `/api/ipfs/${artwork.main[0].hash}`));

  $: cover = !showDetails;
  $: contain = showDetails;
  $: setLoaded(img, vid);
  let setLoaded = (img, vid) => {
    if (!artwork) return;

    img &&
      (img.onload = () => {
        $loaded[artwork.id] = true;
        $loaded = $loaded;
      });

    vid &&
      (vid.onloadeddata = () => {
        $loaded[artwork.id] = true;
        $loaded = $loaded;
      });
  };

  function hasAudio(v) {
    if (!v) return false;
    return (
      v.mozHasAudio ||
      Boolean(v.webkitAudioDecodedByteCount) ||
      Boolean(v.audioTracks && v.audioTracks.length)
    );
  }

  let loadVideo = async () => {
    await new Promise((r) => setTimeout(r, 50));
    if (!vid) return;
    if ("IntersectionObserver" in window) {
      var lazyVideoObserver = new IntersectionObserver(function (
        entries,
        observer
      ) {
        entries.forEach(function (video) {
          if (video.isIntersecting) {
            for (var source in video.target.children) {
              var videoSource = video.target.children[source];
              if (
                typeof videoSource.tagName === "string" &&
                videoSource.tagName === "SOURCE"
              ) {
                videoSource.src = videoSource.dataset.src;
              }
            }

            video.target.load();
            video.target.classList.remove("lazy");
            lazyVideoObserver.unobserve(video.target);
          }
        });
      });

      lazyVideoObserver.observe(vid);
    }
  };

  onMount(loadVideo);
  $: loadVideo(preview || src);
  $: reloadVideo(artwork || src);
  let reloadVideo = () => (vid && vid.currentTime) || loadVideo();

  let muted = true;
  let invisible = true;

  let over = () => vid && hasAudio(vid) && (invisible = false);
  let out = () => (invisible = true);

  let toggleSound = () => {
    muted = !muted;
    vid.muted = muted;
  };

  let showPopup = false;

  let test = true;
</script>

{#if thumb && artwork?.thumb?.length && artwork.thumb[0]}
  <div class:cover class:contain>
    <img
      src={`/api/ipfs/${artwork.thumb[0].hash}`}
      alt={title}
      bind:this={img}
      on:click={() => {
        if (popupImage === true) {
          showPopup = !showPopup;
        }
      }}
      class="z relative"
      class:featured
      class:square
    />
    {#if showPopup}
      <div
        class:showPopup
        class="popup cursor-default"
        on:click={() => (showPopup = !showPopup)}
      >
        <span class="closeButton" on:click={() => (showPopup = !showPopup)}
          ><Fa icon={faTimes} /></span
        >
        <img
          src={`/api/ipfs/${artwork.thumb[0].hash}`}
          alt={title}
          on:click={() => (showPopup = !showPopup)}
          class="w-1/2 cursor-pointer"
        />
      </div>
    {/if}
    {#if featured}
      <img
        src="/svg_icons/profile_featured.svg"
        alt="Profile featured icon"
        class="absolute top-4 left-4 bg-black/50 rounded-lg index w-16"
      />
      <p
        class="absolute index bottom-[0.5px] py-4 text-white font-bold bg-black/50 w-full text-center"
      >
        Featured experience
      </p>
    {/if}
    {#if artwork?.redeemed === true}
      <div
        class="h-full w-full greyed absolute top-0 z flex justify-center items-center"
        on:click={() => {
          if (popupImage === true) {
            showPopup = !showPopup;
          }
        }}
      >
        <h1
          class="-skew-y-[35deg] text-xl py-6 text-center gradient w-full text-white"
        >
          Experience Redeemed
        </h1>
      </div>
    {/if}
  </div>
{:else if isVideo}
  <div
    class="w-full"
    class:inline-block={!popup}
    class:cover
    class:contain
    class:hidden={!loaded}
    on:mouseover={over}
    on:focus={over}
    on:mouseout={out}
    on:blur={out}
  >
    <video
      class:square
      class="lazy"
      autoplay
      muted
      playsinline
      loop
      bind:this={vid}
      controls={popup}
    >
      <track kind="captions" />
      <source data-src={preview || path} />
      Your browser does not support HTML5 video.
    </video>
    {#if !popup}
      <button
        class="absolute hidden md:block bottom-2 right-2 secondary-color"
        type="button"
        class:invisible
        on:click|stopPropagation|preventDefault={toggleSound}
      >
        <Fa icon={muted ? faVolumeMute : faVolumeUp} size="1.5x" />
      </button>
    {/if}
    {#if featured}
      <img
        src="/svg_icons/profile_featured.svg"
        alt="Profile featured icon"
        class="absolute top-4 left-4 bg-black/50 rounded-lg index w-16"
      />
      <p
        class="absolute index bottom-[0.5px] py-4 text-white font-bold bg-black/50 w-full text-center"
      >
        Featured experience
      </p>
    {/if}
    {#if artwork?.redeemed === true}
      <div
        class="h-full w-full greyed absolute top-0 z flex justify-center items-center"
        on:click={() => {
          if (popupImage === true) {
            showPopup = !showPopup;
          }
        }}
      >
        <h1
          class="-skew-y-[35deg] text-xl py-6 text-center gradient w-full text-white"
        >
          Experience Redeemed
        </h1>
      </div>
    {/if}
  </div>
{:else}
  <div class="w-full" class:cover class:contain>
    <img
      src={preview || path}
      alt={title}
      bind:this={img}
      on:click={() => {
        if (popupImage === true) {
          showPopup = !showPopup;
        }
      }}
      class="z relative"
      class:square
      class:featured
    />
    {#if showPopup}
      <div
        class:showPopup
        class="popup cursor-default"
        on:click={() => (showPopup = !showPopup)}
      >
        <span class="closeButton" on:click={() => (showPopup = !showPopup)}
          ><Fa icon={faTimes} /></span
        >
        <img
          src={preview || path}
          alt={title}
          on:click={() => (showPopup = !showPopup)}
          class="w-1/2 cursor-pointer"
        />
      </div>
    {/if}
    {#if featured}
      <img
        src="/svg_icons/profile_featured.svg"
        alt="Profile featured icon"
        class="absolute top-4 left-4 bg-black/50 rounded-lg index w-16"
      />

      <p
        class="absolute index bottom-[0.01px] py-4 text-white font-bold bg-black/50 w-full text-center rounded-b-3xl"
      >
        Featured experience
      </p>
    {/if}

    {#if artwork?.redeemed === true}
      <div
        class="h-full w-full greyed absolute top-0 z flex justify-center items-center"
        on:click={() => {
          if (popupImage === true) {
            showPopup = !showPopup;
          }
        }}
      >
        <h1
          class="-skew-y-[35deg] text-xl py-6 text-center gradient w-full text-white"
        >
          Experience Redeemed
        </h1>
      </div>
    {/if}
  </div>
{/if}

<style>
  .greyed {
    box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.5);
  }

  .gradient {
    background: linear-gradient(
      90deg,
      #fa7900 0%,
      #df36b4 43%,
      #0063ea 77%,
      #00eaaf 100%
    );
  }

  .index {
    z-index: 2;
  }

  .contain,
  .cover {
    width: 100%;
    position: relative;
  }

  .contain img,
  .contain video {
    height: 350px;
    object-fit: cover;
    width: 100%;
  }

  .featured {
    border-radius: 1.5rem;
    height: 500px;
    width: 300px;
    object-fit: cover;
    margin: 0;
  }

  img,
  video {
    max-height: 70vh;
    @apply mx-auto;
  }

  video {
    width: auto;
  }

  .z {
    z-index: 1;
  }

  .popup {
    position: fixed;
    z-index: 9000000000;
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
    width: 100%;
    height: 100vh !important;
    margin: 0 auto;
    z-index: -1;
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

  @media only screen and (max-width: 1023px) {
    .closeButton {
      top: 20px;
      right: 20px;
    }
  }

  @media only screen and (max-width: 500px) {
    .popup :global(img),
    .popup :global(video) {
      height: 100vh;
      width: 100%;
    }
  }

  @media only screen and (max-width: 640px) {
    .featured {
      height: 400px;
    }
  }

  .square {
    @apply mx-auto h-56 w-56 mt-4 object-cover rounded;
  }
</style>
