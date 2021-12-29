<svelte:options accessors/>

<script>
import { goto } from '$lib/utils';
export let close = () => goto('/market');
</script>

<div class="container text-center bg-white p-10">
  <h1 class="text-4xl mb-4 text-transparent bg-clip-text text-gradient">
    Great!!
  </h1>
  <p class="mb-6">
    <strong>Thanks for submitting your experience. We appreciate it.</strong>
    It might take a few minutes while we review it. Good luck!
  </p>
  <img
    src="/static/rocket.png"
    alt="Rocket"
    class="w-40 h-40 mx-auto" />
  <div class="block md:flex justify-center">
    <div class="flex mt-5 md:mt-10">
			<a
        href="https://instagram.com/cozmosnft"
        target="_blank"
        rel="noreferrer">
        <img
          src="/static/svg_icons/Instagram-02.svg"
          alt="Instagram icon"
          class="w-52 md:w-16" />
      </a>
      <a href="https://discord.com/cozmosnft" target="_blank" rel="noreferrer">
        <img
          src="/static/svg_icons/Discord.svg"
          alt="Discord icon"
          class="w-52 md:w-16" />
      </a>
      <a href="https://twitter.com/cozmosnft" target="_blank" rel="noreferrer">
        <img
          src="/static/svg_icons/Twitter-02.svg"
          alt="Twitter icon"
          class="w-52 md:w-16" />
      </a>
    </div>
    <p class="self-center md:ml-16 text-sm md:mt-10">Follow us for updates</p>
  </div>
</div>
