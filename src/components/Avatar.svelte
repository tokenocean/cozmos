<script>
  export let user = undefined;
  export let src = undefined;
  export let overlay = undefined;
  export let size = "sm";
  export let border = "border-2 border-white";
</script>

<div class={`${size} my-auto relative`}>
  <div
    class={`relative ${size} group rounded-full overflow-hidden shadow-inner text-center ${border} rounded-full`}
  >
    {#if user || src}
      <img
        key={user && user.username}
        src={user
          ? `/api/public/${user.avatar_url}`
          : src.startsWith("data")
          ? src
          : `/api/public/${src}`}
        alt={user ? user.username : "lovely avatar"}
        class="absolute w-full h-full object-cover object-center visible overflow-hidden"
      />
    {/if}
  </div>
  {#if overlay}
    <img
      alt="Multisig"
      src={overlay}
      class="w-6 h-6 absolute"
      style="bottom: -8px; right: -20px"
    />
  {/if}
</div>

<style>
  .xs {
    @apply w-10 h-10;
  }

  .sm {
    @apply w-12 h-12;
  }

  .lg {
    @apply w-16 h-16;
  }

  .lgx {
    @apply w-20 h-20;
  }

  .xl {
    @apply w-56 h-56;
  }
</style>
