<script>
  import { browser } from "$app/env";
  import { Pagination } from "$comp";
  import { onMount, tick } from "svelte";
  import Card from "$styleguide/components/Card.svelte";

  export let filtered;
  export let count;

  let inview = filtered.slice(0, 24);
  let debug;

  let w, h;
  let hidden;
  let maxPages = 7;
  $: columns = w >= 1024 ? 3 : w >= 640 ? 2 : 1;

  let st;
  let y;

  let content, rh, newrows, nh, viewportHeight;

  let resize = () => {
    if (!window) return;
    st = undefined;
    window.scrollTo(0, 0);
    setTimeout(init, 50);
  };

  onMount(() => setTimeout(resize, 50));
  let retry;

  $: browser && init(filtered);
  let init = async () => {
    await tick();

    let el = document.querySelector(".market-gallery");
    if (!el) return scroll(y);

    let { top, bottom } = el.getBoundingClientRect();
    rh = bottom - top;
    if (!st) st = top;

    newrows = Math.ceil(count / columns);
    nh = rh * (newrows + 1) - y;
    content.style.height = `${nh + (columns > 1 ? 200 : 0)}px`;
    scroll(y);
  };

  let a, cr, translate, sf;
  let c = 30;
  let timeout;
  let justScrolled;
  let x;

  $: browser && scroll(y, c);
  let scroll = (y) => {
    window.requestAnimationFrame(() => {
      clearTimeout(timeout);
      if (!st || !rh) return;
      cr = Math.round((y - st) / rh);
      let p = 2 * columns;
      a = Math.max(0, cr * columns);
      if (a >= 0) inview = filtered.slice(a >= p ? a - columns : 0, a + p);

      // x is a magical smoothing factor derived by guessing and testing
      x = cr > 1 ? parseInt((13 * rh) / (y + 40 - cr * rh)) : 0;
      if (columns === 1)
        x = Math.min(Math.round((5 * rh) / (y + 40 - cr * rh)), 100);

      translate = Math.max(0, cr * rh - rh) + x;
      justScrolled = true;
      setTimeout(() => (justScrolled = false), 250);
    });
  };

</script>

<style>
  .market-gallery :global(.card-link img),
  .market-gallery :global(.card-link video) {
    height: 350px;
  }

</style>

<svelte:window bind:innerWidth={w} bind:scrollY={y} on:resize={resize} />

{#if debug}
  <div class="fixed bg-white z-50 left-2 w-48 top-24">
    {Math.round(x)}
  </div>
{/if}

<div bind:this={content}>
  <div class="sm:grid sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
    {#each inview as artwork, i}
      <div
        class="market-gallery w-full mb-20"
        style={`transform: translateY(${translate}px)`}>
        <Card {artwork} bind:justScrolled height={350} />
      </div>
    {/each}
  </div>
</div>
