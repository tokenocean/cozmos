<script>
  import { Avatar } from "$comp";
  import { session } from "$app/stores";
  export let open = false;
</script>

<span
  class="text-gray-500 hover:text-gray-700 cursor-pointer border-none focus:outline-none p-0"
  class:open
  on:click={() => (open = !open)}
>
  <a class="mobileSearch z-20 relative" href="">
    <Avatar border="" size="xs" user={$session.user} />
  </a>
</span>
