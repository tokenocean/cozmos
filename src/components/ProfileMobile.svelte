<script>
  export let open = false;
</script>

<span
  class="text-gray-500 hover:text-gray-700 cursor-pointer border-none focus:outline-none p-0"
  class:open
  on:click={() => (open = !open)}
>
  <a class="mobileSearch z-20 relative" href="">
    <img src="/svg_icons/profile_mobile.png" alt="profile icon" class="w-4" />
  </a>
</span>
