<script>
  import { err, goto, sats, val } from "$lib/utils";
  import { FileUpload, FormItem, PhotoGallery } from "$comp";
  import { browser } from "$app/env";
  import { query } from "$lib/api";
  import Fa from "svelte-fa";
  import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
  import { Auction, Fixed } from "$icons";
  import { page } from "$app/stores";
  import { tick } from "svelte";
  import Select from "svelte-select";
  import { onMount } from "svelte";
  import Button from "$styleguide/components/Button.svelte";
  import Input from "$styleguide/components/Input.svelte";
  import Textarea from "$styleguide/components/Textarea.svelte";
  import { prompt, rate } from "$lib/store";
  import {
    format,
    addDays,
    compareAsc,
    isWithinInterval,
    parse,
    parseISO,
    addMinutes,
  } from "date-fns";

  export let artwork;
  export let files = [];

  let list_price,
    reserve_price,
    start,
    end,
    input,
    items,
    loading,
    timer,
    fiat,
    fiat_price,
    vid;
  let fixed = $rate;

  $: if (fiat_price) list_price = (fiat_price / fixed).toFixed(8);
  $: if (fiat_price) reserve_price = (fiat_price / fixed).toFixed(8);

  list_price = val(artwork.asking_asset, artwork.list_price);

  $: if (list_price)
    artwork.list_price = sats(artwork.asking_asset, list_price);
  /* $: artwork.auction_end = sats(artwork.asking_asset, list_price); */

  let toggleFiat = () => {
    fiat = !fiat;
    if (fiat) {
      if (list_price) {
        fiat_price = (list_price * fixed).toFixed(2);
      } else if (reserve_price) {
        fiat_price = (reserve_price * fixed).toFixed(2);
      } else {
        fiat_price = "";
      }
    }
  };

  let gallery;

  let start_date, end_date, start_time, end_time;
  if (artwork.auction_start) {
    start = parseISO(artwork.auction_start);
    start_date = format(start, "yyyy-MM-dd");
    start_time = format(start, "HH:mm");
  }

  if (artwork.auction_end) {
    end = parseISO(artwork.auction_end);
    end_date = format(end, "yyyy-MM-dd");
    end_time = format(end, "HH:mm");
  }

  let enableAuction = () => {
    if (!start_date) {
      start_date = format(addMinutes(new Date(), 15), "yyyy-MM-dd");
      start_time = format(addMinutes(new Date(), 15), "HH:mm");
    }
    if (!end_date) {
      end_date = format(addMinutes(addDays(new Date(), 3), 15), "yyyy-MM-dd");
      end_time = format(addMinutes(addDays(new Date(), 3), 15), "HH:mm");
    }
  };

  $: updateDates(start_date, start_time, end_date, end_time);
  let updateDates = () => {
    artwork.auction_start = parse(
      `${start_date} ${start_time}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );
    artwork.auction_end = parse(
      `${end_date} ${end_time}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );
  };

  $: images = files.filter((f) => f.type === "gallery");

  const addFile = ({ detail: file }) => {
    files = [
      ...files.filter((f) => f.type === "gallery" || f.type !== file.type),
      file,
    ];

    artwork[file.type] = [file];
    if (vid) vid.load();
  };

  onMount(() => {
    query(`query { tags { tag } }`)
      .then(
        (res) =>
          (items = [...new Set(res.tags.map((t) => t.tag))].map((value) => ({
            value,
            label: value,
          })))
      )
      .catch(err);
  });

  $: focus($page);
  export let focus = (p) =>
    browser && p && tick().then(() => input && input.select());

  let value;
  $: value = artwork.tags.map(({ tag }) => ({
    value: tag,
    label: tag,
  }));

  const tagsSelect = ({ detail }) => {
    if (detail === null) {
      artwork.tags = [];
    } else {
      artwork.tags = detail.map(({ value: tag }) => ({ tag }));
    }
  };

  const TYPES = {
    UNLISTED: "UNLISTED",
    FIXED: "FIXED",
    AUCTION: "AUCTION",
  };

  let listingType = TYPES.FIXED;

  function selectListingType(type) {
    if (type === TYPES.AUCTION) enableAuction();
    return () => {
      listingType = type;
    };
  }
</script>

<form class="flex flex-col w-full mb-6" on:submit autocomplete="off">
  <div class="md:grid md:grid-cols-2 md:text-left md:p-4">
    {#if $page.url.pathname.includes("/create")}
      <FormItem title="Upload NFT Image" text="text-center">
        <div class="text-sm text-black text-center">
          (Cannot be changed once submitted)
        </div>
        <div
          class="w-[80%] mx-auto hover:border-black border-2 border-gray-300 rounded-xl mb-8"
        >
          {#if artwork.main && artwork.main.length}
            <img
              src={`/api/ipfs/${artwork.main[0].hash}`}
              alt="Main"
              class="mx-auto w-56 mt-4 nftimage object-cover rounded"
            />
          {/if}
          <FileUpload
            {artwork}
            type="main"
            limits="PNG, JPG, GIF, MP4, WEBP, MAX 10MB"
            on:upload={addFile}
            previewEnabled={false}
          />
        </div>
      </FormItem>
    {/if}
    <FormItem title="Upload Card Thumbnail" text="text-center">
      <div class="text-sm text-black text-center">(Optional)</div>
      <div
        class="w-[80%] mx-auto hover:border-black border-2 border-gray-300 rounded-xl mb-8"
      >
        {#if artwork.thumb && artwork.thumb.length}
          <img
            src={`/api/ipfs/${artwork.thumb[0].hash}`}
            alt="Thumb"
            class="mx-auto w-56 mt-4 nftimage object-cover rounded"
          />
        {/if}
        <FileUpload
          {artwork}
          title="Upload Card Thumbnail"
          type="thumb"
          limits="PNG, JPG, WEBP, MAX 10MB"
          on:upload={addFile}
          previewEnabled={false}
        />
      </div>
    </FormItem>
    <FormItem title="Upload Cover Image" text="text-center">
      <div class="text-sm text-black text-center">(Optional)</div>
      <div
        class="w-[80%] mx-auto hover:border-black border-2 border-gray-300 rounded-xl mb-8"
      >
        {#if artwork.cover && artwork.cover.length}
          <img
            src={`/api/ipfs/${artwork.cover[0].hash}`}
            alt="Cover"
            class="mx-auto w-72 mt-4 cover object-cover rounded"
          />
        {/if}
        <FileUpload
          {artwork}
          type="cover"
          limits="PNG, JPG, WEBP, MAX 10MB"
          on:upload={addFile}
          previewEnabled={false}
        />
      </div>
    </FormItem>
    <FormItem title="Upload Video" text="text-center">
      <div class="text-sm text-black text-center">(Optional)</div>
      <div
        class="w-[80%] mx-auto hover:border-black border-2 border-gray-300 rounded-xl mb-8"
      >
        {#if artwork.video && artwork.video.length}
          <video
            autoplay
            loop
            controls
            muted
            disablepictureinpicture
            controlslist="nodownload"
            key={artwork.video[0].hash}
            bind:this={vid}
            class="mx-auto w-72 mt-4 cover object-cover rounded"
          >
            <source src={`/api/ipfs/${artwork.video[0].hash}`} />
          </video>
        {/if}
        <FileUpload
          {artwork}
          type="video"
          limits="MP4, MAX 100MB"
          on:upload={addFile}
          previewEnabled={false}
        />
      </div>
    </FormItem>
    <FormItem title="Upload Gallery Photo" text="text-center">
      <div class="text-sm text-black text-center">(Optional)</div>
      <div
        class="w-[80%] mx-auto hover:border-black border-2 border-gray-300 rounded-xl mb-8"
      >
        {#if artwork.gallery && artwork.gallery.length}
          <div class="mt-4 mx-auto">
            <PhotoGallery {images} bind:this={gallery} />
          </div>
        {/if}
        <FileUpload
          {artwork}
          type="gallery"
          limits="PNG, JPG, WEBP, MAX 10MB"
          on:upload={addFile}
          previewEnabled={false}
        />
      </div>
    </FormItem>
  </div>

  <!-- Artwork title -->

  <div class="py-2">
    <FormItem title="Experience title">
      <Input bind:value={artwork.title} placeholder="Title" />
    </FormItem>
  </div>

  <!-- Artwork description -->

  <div class="py-2">
    <FormItem title="Experience description">
      <Textarea bind:value={artwork.description} placeholder="Description" />
    </FormItem>
  </div>

  <div class="py-2">
    <FormItem title="Package content">
      <Textarea
        bind:value={artwork.package_content}
        placeholder="Describe what is included in experience"
      />
    </FormItem>
  </div>

  <hr class="my-4" />

  <div class="py-4">
    <FormItem title="Sell on marketplace">
      <div class="md:grid md:gap-8 md:grid-cols-2 py-4">
        <div>
          <div
            on:click={selectListingType(TYPES.FIXED)}
            class:active={listingType === TYPES.FIXED}
            class="sell-type cursor-pointer text-center mt-4 h-44 rounded-md border-gray-300 border flex flex-col justify-center items-center"
          >
            <Fixed active={listingType === TYPES.FIXED} />
            Fixed Price
          </div>
        </div>
        <div>
          <div
            on:click={selectListingType(TYPES.AUCTION)}
            class:active={listingType === TYPES.AUCTION}
            class="sell-type cursor-pointer text-center mt-4 h-44 rounded-md border-gray-300 border flex flex-col justify-center items-center"
          >
            <Auction active={listingType === TYPES.AUCTION} />
            Auction<br />
          </div>
        </div>
      </div>
    </FormItem>
  </div>

  <div>
    <div class="md:grid md:gap-8 md:grid-cols-2 py-4">
      <div>
        {#if listingType === TYPES.FIXED}
          <FormItem title="Price">
            <div class="flex">
              {#if fiat}
                <input
                  min="1"
                  type="number"
                  class="text-sm appearance-none h-12 rounded-md bg-gray-100 border border-gray-300 mt-2 w-full"
                  step="0.01"
                  bind:value={fiat_price}
                  placeholder="Price for NFT experience"
                />
              {:else}
                <input
                  min="0.00001000"
                  type="number"
                  class="text-sm appearance-none h-12 rounded-md bg-gray-100 border border-gray-300 mt-2 w-full"
                  step="0.00001"
                  bind:value={list_price}
                  placeholder="Price for NFT experience"
                />
              {/if}
            </div></FormItem
          >
        {/if}
        {#if listingType === TYPES.AUCTION}
          <FormItem title="Minimum bid">
            {#if fiat}
              <input
                min="1"
                type="number"
                step="0.01"
                required
                bind:value={fiat_price}
                placeholder="Minimum bid"
                class="text-sm appearance-none h-12 rounded-md bg-gray-100 border border-gray-300 mt-2 w-full"
              />
            {:else}
              <input
                min="0.00001000"
                type="number"
                step="0.00001"
                required
                bind:value={reserve_price}
                placeholder="Minimum bid"
                class="text-sm appearance-none h-12 rounded-md bg-gray-100 border border-gray-300 mt-2 w-full"
              />
            {/if}
          </FormItem>
        {/if}
        <button
          type="button"
          name="button"
          class="border border-black rounded w-20 mt-1"
          class:bg-black={!fiat}
          class:text-white={!fiat}
          on:click={toggleFiat}>L-BTC</button
        >
        <button
          type="button"
          name="button"
          class="border border-black rounded w-20 mt-1"
          class:bg-black={fiat}
          class:text-white={fiat}
          on:click={toggleFiat}>USD</button
        >
        <div class="mt-4">
          <ul class="text-sm list-disc ml-4">
            <li>
              We take a 10% commission on the sale, take that<br />
              into consideration when listing your experience.
            </li>
            <li class="mt-2">
              1% will be donated to charity,<br />
              our goal is to give back to the community.
            </li>
          </ul>
        </div>
      </div>
      <div class="mt-4 md:mt-0">
        {#if listingType === TYPES.AUCTION}
          <FormItem title="Starting date">
            <div class="grid grid-cols-2 gap-4">
              <input
                id="startdate"
                type="date"
                name="startdate"
                bind:value={start_date}
                class="text-sm appearance-none h-12 rounded-md bg-gray-100 border border-gray-300 mt-2 w-full"
              />
              <input
                id="starttime"
                type="time"
                name="starttime"
                bind:value={start_time}
                class="text-sm appearance-none h-12 rounded-md bg-gray-100 border border-gray-300 mt-2 w-full"
              />
            </div>
          </FormItem>
          <FormItem title="Expiration date" class="mt-4">
            <div class="grid grid-cols-2 gap-4">
              <input
                id="enddate"
                type="date"
                name="enddate"
                bind:value={end_date}
                class="text-sm appearance-none h-12 rounded-md bg-gray-100 border border-gray-300 mt-2 w-full"
              />
              <input
                id="endtime"
                type="time"
                name="endtime"
                bind:value={end_time}
                class="text-sm appearance-none h-12 rounded-md bg-gray-100 border border-gray-300 mt-2 w-full"
              />
            </div>
          </FormItem>
        {/if}
      </div>
    </div>
  </div>

  <Button type="submit" primary class="w-full mt-8">
    Submit an experience
  </Button>
</form>

<style lang="scss">
  .cover {
    height: 14rem;
  }

  .nftimage {
    height: 14rem;
  }

  .sell-type {
    svg {
      path {
        fill: #000;
      }
    }
    &.active {
      @apply bg-black text-white;
      svg {
        path {
          fill: #fff;
        }
      }
    }
  }

  :global(.selectContainer) {
    background: transparent !important;
    @apply text-sm appearance-none h-12 rounded-md bg-gray-100 border border-gray-300 mt-2 w-full #{!important};
  }
</style>
