<script context="module">
  import { prerendering } from "$app/env";
  import { get } from "$lib/api";
  import "../main.css";

  export async function load({ fetch, url, session }) {
    if (prerendering)
      return {
        props: {
          addresses: [],
          titles: [],
        },
      };

    const props = await get("/addresses.json", fetch);
    const { rate } = await get("/rate.json", fetch);
    props.rate = rate;

    if (
      session &&
      session.user &&
      !session.user.wallet_initialized &&
      (!["/wallet", "/logout"].find((p) => url.pathname.includes(p)) ||
        url.pathname === "/wallet")
    )
      return {
        status: 302,
        redirect: "/wallet/setup",
      };

    return {
      props,
    };
  }
</script>

<script>
  import { browser } from "$app/env";
  import { page, session } from "$app/stores";
  import decode from "jwt-decode";
  import { Sidebar, Sidebar2, Dialog, StandardDialog, Footer, Snack, Head } from "$comp";
  import {
    addresses as a,
    meta,
    headerHeight,
    titles as t,
    user,
    password,
    poll,
    rate as r,
    token,
  } from "$lib/store";
  import { onDestroy, onMount } from "svelte";
  import branding from "$lib/branding";
  import Navbar from "$styleguide/components/Navbar/Navbar.svelte";

  export let addresses, rate, titles;

  let getExchangeRate = async () => {
    try {
      $r = (await get("/rate.json", fetch)).rate;
    } catch (e) {
      console.log(e);
    }
  };

  let interval, rateInterval;

  let refresh = async () => {
    if (!$session.jwt) return;

    try {
      let { jwt_token } = await get("/auth/refresh.json", fetch);
      $token = jwt_token;
      if (!$token && $session) delete $session.user;
    } catch (e) {
      console.log(e);
    }
  };

  if (browser) {
    history.pushState = new Proxy(history.pushState, {
      apply(target, thisArg, argumentsList) {
        Reflect.apply(target, thisArg, argumentsList);
        scrollTo(0, 0);
      },
    });

    $a = addresses;
    $t = titles;
    $r = rate;

    if ($session) {
      $user = $session.user;
      $token = $session.jwt;
    }

    clearInterval(interval);
    clearInterval(rateInterval);
    interval = setInterval(refresh, 60000);
    rateInterval = setInterval(getExchangeRate, 30000);
  }
  let open = false;
  let openProfile = false;
  let y;

  let stopPolling = () => $poll.map(clearInterval);
  $: stopPolling($page);

  onDestroy(() => clearInterval(interval));
  onMount(() => {
    if (browser && !$password)
      $password = window.sessionStorage.getItem("password");
  });
  let margin;
  $: margin && (margin.style.marginTop = `${$headerHeight}px`);
</script>

<svelte:window bind:scrollY={y} />

{#if !($page.url.pathname.includes("/a/") && $page.url.pathname.split("/").length === 3)}
  <Head metadata={branding.meta} />
{/if}

<Snack />
<Sidebar2 bind:openProfile />
<Sidebar bind:open />
<div>
  <Navbar bind:sidebar={open} bind:sidebar2={openProfile} />
</div>

<StandardDialog />
<Dialog />

<main>
  <div
    class="mx-auto min-h-screen"
    class:stars={$page.url.pathname.includes("/wallet")}
    class:padding={$page.url.pathname.includes("transfer")}
    bind:this={margin}
  >
    <slot />
  </div>
</main>

<Footer />

<style>
  .padding {
    padding: 0 5%;
  }

  .stars {
    background: linear-gradient(
      135deg,
      #f28400 0%,
      #ef4baf 43%,
      #173af7 77%,
      #5fefbb 100%
    );
  }

  @media (min-width: 768px) {
    .stars {
      background-image: url("/background_black.png");
      background-size: cover;
    }
  }
</style>
