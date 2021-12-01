<script context="module">
  export async function load({ fetch, page }) {
    const props = await fetch(`/addresses.json`).then((r) => r.json());

    return {
      maxage: 90,
      props,
    };
  }

</script>

<script>
  import { session } from "$app/stores";
  import decode from "jwt-decode";
  import {
    Avatar,
    ProgressLinear,
    Sidebar,
    Dialog,
    Footer,
    Snack,
    Head,
  } from "$comp";
  import {
    addresses as addressesStore,
    prompt,
    show,
    user,
    password,
    titles as titlesStore,
    token,
  } from "$lib/store";
  import Navbar from "$styleguide/components/Navbar/Navbar.svelte";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  export let addresses, titles;

  if (browser)
    history.pushState = new Proxy(history.pushState, {
      apply(target, thisArg, argumentsList) {
        Reflect.apply(target, thisArg, argumentsList);
        scrollTo(0, 0);
      },
    });

  $a = addresses;
  $t = titles;

  $user = $session.user;
  $token = $session.jwt;

  $addressesStore = addresses;
  $titlesStore = titles;

  onMount(() => {
    if (!$password) $password = window.sessionStorage.getItem("password");
  });

</script>

<style global src="../main.css">
</style>

<svelte:window bind:scrollY={y} />

<Head metadata={branding.meta} />

<Snack />

<Sidebar bind:open />
<div class={y > 50 ? 'sticky' : ''}>
  <Navbar bind:sidebar={open} />
</div>
<Dialog />

<main>
  <div class="mx-auto min-h-screen">
    <slot />
  </div>
</main>

<Footer />
