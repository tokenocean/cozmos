<script>
  import { err, goto, sats, val, btc, types } from "$lib/utils";
  import { ArtworkMedia, FileUpload, FormItem, PhotoGallery } from "$comp";
  import { browser } from "$app/env";
  import { query } from "$lib/api";
  import Fa from "svelte-fa";
  import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
  import { Auction, Fixed, Unlisted } from "$icons";
  import { page } from "$app/stores";
  import { tick } from "svelte";
  import { RoyaltyRecipientList } from "$comp";
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
    isValid,
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

  list_price = val(artwork.asking_asset, artwork.list_price) || "";

  $: if (list_price && listingType === types.FIXED)
    artwork.list_price = sats(artwork.asking_asset, list_price);
  else artwork.list_price = undefined;

  $: if (reserve_price && listingType === types.AUCTION)
    artwork.reserve_price = sats(artwork.asking_asset, reserve_price);
  else artwork.reserve_price = undefined;

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
    listingType = types.AUCTION;

    if (!start_date) {
      start_date = format(addMinutes(new Date(), 15), "yyyy-MM-dd");
      start_time = format(addMinutes(new Date(), 15), "HH:mm");
    }
    if (!end_date) {
      end_date = format(addMinutes(addDays(new Date(), 3), 15), "yyyy-MM-dd");
      end_time = format(addMinutes(addDays(new Date(), 3), 15), "HH:mm");
    }
  };

  let enableFixedPrice = () => {
    listingType = types.FIXED;
  };

  let enableUnlisted = () => {
    listingType = types.UNLISTED;
  };

  $: updateDates(start_date, start_time, end_date, end_time, listingType);
  let updateDates = () => {
    if (listingType === types.AUCTION) {
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

      if (!isValid(artwork.auction_start)) artwork.auction_start = undefined;
      if (!isValid(artwork.auction_end)) artwork.auction_end = undefined;
    } else {
      artwork.auction_start = undefined;
      artwork.auction_end = undefined;
    }

    if (listingType === types.UNLISTED || !listingType)
      artwork.asking_asset = undefined;
  };

  $: images = files.filter((f) => f.type === "gallery");

  const addFile = async ({ detail: file }) => {
    files = [
      ...files.filter((f) => f.type === "gallery" || f.type !== file.type),
      file,
    ];

    artwork[file.type] = [file];
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

  let listingType = artwork.list_price
    ? types.FIXED
    : artwork.auction_end
    ? types.AUCTION
    : types.UNLISTED;
</script>

<form class="flex flex-col w-full mb-6" on:submit autocomplete="off">
  <div class="md:grid md:grid-cols-2 md:text-left">
    {#if $page.url.pathname.includes("/create")}
      <FormItem title="Upload NFT File" text="text-center">
        <div class="mx-0 md:mx-2">
          <div class="text-sm text-black text-center">
            (Cannot be changed once submitted)
          </div>
          <div
            class="w-full hover:border-black border border-gray-300 rounded-xl mb-8"
          >
            {#if artwork.main && artwork.main.length}
              <ArtworkMedia
                src={`/api/ipfs/${artwork.main[0].hash}`}
                filetype={artwork.main[0].filetype}
                square={true}
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
        </div>
      </FormItem>
    {/if}
    <FormItem title="Upload Card Thumbnail" text="text-center">
      <div class="mx-0 md:mx-2">
        <div class="text-sm text-black text-center">(Optional)</div>
        <div
          class="w-full hover:border-black border border-gray-300 rounded-xl mb-8"
        >
          {#if artwork.thumb && artwork.thumb.length}
            <ArtworkMedia
              src={`/api/ipfs/${artwork.thumb[0].hash}`}
              filetype={artwork.thumb[0].filetype}
              square={true}
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
      </div>
    </FormItem>
    <FormItem title="Upload Cover Image" text="text-center">
      <div class="mx-0 md:mx-2">
        <div class="text-sm text-black text-center">(Optional)</div>
        <div
          class="w-full hover:border-black border border-gray-300 rounded-xl mb-8"
        >
          {#if artwork.cover && artwork.cover.length}
            <ArtworkMedia
              src={`/api/ipfs/${artwork.cover[0].hash}`}
              filetype={artwork.cover[0].filetype}
              square={true}
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
      </div>
    </FormItem>
    <FormItem title="Upload Video" text="text-center">
      <div class="mx-0 md:mx-2">
        <div class="text-sm text-black text-center">(Optional)</div>
        <div
          class="w-full hover:border-black border border-gray-300 rounded-xl mb-8"
        >
          {#if artwork.video && artwork.video.length}
            <ArtworkMedia
              src={`/api/ipfs/${artwork.video[0].hash}`}
              filetype={artwork.video[0].filetype}
              square={true}
            />
          {/if}
          <FileUpload
            {artwork}
            type="video"
            limits="MP4, MAX 100MB"
            on:upload={addFile}
            previewEnabled={false}
          />
        </div>
      </div>
    </FormItem>
  </div>
  <FormItem title="Upload Gallery Photo" text="text-center">
    <div class="w-full">
      <div class="text-sm text-black text-center">(Optional)</div>
      <div
        class="w-full hover:border-black border border-gray-300 rounded-xl mb-8"
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
    </div>
  </FormItem>

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

  <div class="py-4 w-full lg:w-1/2">
    <FormItem title="Royalties">
      <RoyaltyRecipientList
        bind:items={artwork.royalty_recipients}
        maxTotalRate={100}
        askingAsset={artwork.asking_asset}
        artist={artwork.artist}
      />
    </FormItem>
  </div>

  <hr class="my-4" />

  <div class="py-4">
    <FormItem title="Sell on marketplace">
      <div class="md:grid md:gap-4 md:grid-cols-3 py-4">
        <div>
          <div
            on:click={() => (listingType = types.UNLISTED)}
            class:active={listingType === types.UNLISTED}
            class="sell-type cursor-pointer text-center mt-4 h-44 rounded-md border-gray-300 border flex flex-col justify-center items-center"
          >
            <Unlisted active={listingType === types.UNLISTED} />
            Unlisted
          </div>
        </div>
        <div>
          <div
            on:click={enableFixedPrice}
            class:active={listingType === types.FIXED}
            class="sell-type cursor-pointer text-center mt-4 h-44 rounded-md border-gray-300 border flex flex-col justify-center items-center"
          >
            <Fixed active={listingType === types.FIXED} />
            Fixed Price
          </div>
        </div>
        <div>
          <div
            on:click={enableAuction}
            class:active={listingType === types.AUCTION}
            class="sell-type cursor-pointer text-center mt-4 h-44 rounded-md border-gray-300 border flex flex-col justify-center items-center"
          >
            <Auction active={listingType === types.AUCTION} />
            Auction<br />
          </div>
        </div>
      </div>
    </FormItem>
  </div>

  <div>
    <div class="md:grid md:gap-8 md:grid-cols-2 py-4">
      <div>
        {#if listingType === types.FIXED}
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
        {#if listingType === types.AUCTION}
          <FormItem title="Minimum bid">
            {#if fiat}
              <input
                min="1"
                type="number"
                step="0.01"
                bind:value={fiat_price}
                placeholder="Minimum bid"
                class="text-sm appearance-none h-12 rounded-md bg-gray-100 border border-gray-300 mt-2 w-full"
              />
            {:else}
              <input
                min="0.00001000"
                type="number"
                step="0.00001"
                bind:value={reserve_price}
                placeholder="Minimum bid"
                class="text-sm appearance-none h-12 rounded-md bg-gray-100 border border-gray-300 mt-2 w-full"
              />
            {/if}
          </FormItem>
        {/if}
        {#if listingType === types.UNLISTED}
          The experience will be minted and available for editing but will not
          be visible in the marketplace until you list it.
        {:else}
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
        {/if}
      </div>
      <div class="mt-4 md:mt-0">
        {#if listingType === types.AUCTION}
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
  {#if $page.url.pathname.includes("/create")}
    <Button type="submit" primary class="w-full mt-8">
      Submit an experience
    </Button>
  {:else}
    <Button type="submit" primary class="w-full mt-8">Edit experience</Button>
  {/if}
</form>

<style lang="scss">
  .sell-type {
    &.active {
      @apply bg-black text-white;
    }
  }

  :global(.selectContainer) {
    background: transparent !important;
    @apply text-sm appearance-none h-12 rounded-md bg-gray-100 border border-gray-300 mt-2 w-full #{!important};
  }
</style>
