<script>
  export let id;
  export let label;
  export let checked = false;
</script>

<div class="relative inline-block w-10 mr-2 align-middle select-none ease-in">
  <input
    type="checkbox"
    name="toggle"
    {id}
    class="toggle-checkbox absolute p-0 block w-6 h-6 rounded-full background appearance-none cursor-pointer outline-none"
    bind:checked
    on:change
  />
  <label
    for={id}
    class="toggle-label block overflow-hidden h-6 rounded-full border cursor-pointer"
  />
</div>
<label for={id} class="cursor-pointer">{label}</label>

<style>
  .border {
    border: 1px solid grey;
  }

  .background {
    background: linear-gradient(
      90deg,
      #fa7900 0%,
      #df36b4 43%,
      #0063ea 77%,
      #00eaaf 100%
    );
  }

  .toggle-checkbox:checked {
    @apply right-0;
    border: 1px solid grey;
    right: 0;
  }
  .toggle-checkbox:checked + .toggle-label {
    background: grey;
  }
</style>
