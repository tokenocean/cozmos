<script context="module">
  export async function load({ session }) {
    if (session && session.user) {
      return {
        status: 301,
        redirect: "/",
      };
    }

    return {};
  }
</script>

<script>
  import Button from "$styleguide/components/Button.svelte";
  import Fa from "svelte-fa";
  import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
  import { page, session } from "$app/stores";
  import { dev, err, goto } from "$lib/utils";
  import { post } from "$lib/api";
  import cryptojs from "crypto-js";
  import { tick } from "svelte";
  import { keypair, singlesig, multisig } from "$lib/wallet";
  import { token, user } from "$lib/store";
  import { onMount } from "svelte";

  let show;
  let email = "";
  let password = dev ? "liquidart" : "";

  let emailInput;
  let pageChange = () =>
    setTimeout(() => emailInput && emailInput.select(), 50);
  $: if (emailInput) pageChange($page);

  let login = async () => {
    window.sessionStorage.setItem("password", password);
    try {
      let res = await post("/auth/login", { email, password }, fetch).json();
      $user = res.user;
      $token = res.jwt_token;
      $session = { user: $user };
      goto("/");
    } catch (e) {
      err(e);
    }
  };

  onMount(() => {
    session.set(null);
    token.set(null);
    user.set(null);
  });
</script>

<div class="backgroundBlack form-container px-4">
  <form
    class="mb-6 rounded-xl md:bg-black w-full xl:w-[30%]"
    on:submit|preventDefault={login}
    autocomplete="off"
  >
    <h2 class="mb-8 text-black md:text-white md:text-center">Sign In</h2>
    <div class="flex flex-col mb-4">
      <label class="mb-2 font-medium text-black md:text-white" for="first_name"
        >Email or username</label
      >
      <input
        bind:value={email}
        bind:this={emailInput}
        class="bg-transparent md:bg-black"
        autocapitalize="off"
        data-cy="user"
      />
    </div>
    <div class="flex flex-col mb-4">
      <label class="mb-2 font-medium text-black md:text-white" for="last_name"
        >Password</label
      >
      <div class="relative">
        {#if show}
          <input
            class="w-full bg-transparent md:bg-black"
            bind:value={password}
            autocapitalize="off"
          />
        {:else}
          <input
            class="w-full bg-transparent md:bg-black"
            type="password"
            bind:value={password}
            autocapitalize="off"
            data-cy="password"
          />
        {/if}
        <button
          class="absolute h-full px-3 right-0 top-0 w-auto text-white"
          type="button"
          on:click|preventDefault|stopPropagation={() => (show = !show)}
        >
          <Fa
            icon={show ? faEyeSlash : faEye}
            class="text-black md:text-white my-auto mr-1"
          />
        </button>
      </div>
    </div>
    <a href="/forgot-password" class="block w-full text-black md:text-white"
      >Forgot password?</a
    >
    <div class="flex my-5 justify-end">
      <Button primary class="hidden md:block w-full" type="submit"
        >Sign In</Button
      >
      <Button
        class="block md:hidden w-full bg-black rounded-full text-white font-bold"
        type="submit">Sign In</Button
      >
    </div>
    <a href="/register" class="text-black md:text-white"
      >Don't have an account? <span class="underline">Sign up</span></a
    >
  </form>
</div>

<style>
  .backgroundBlack {
    background: linear-gradient(
      135deg,
      #f28400 0%,
      #ef4baf 43%,
      #173af7 77%,
      #5fefbb 100%
    );
  }

  .form-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .form-container form {
    max-width: 550px;
    padding: 20px;
  }

  input {
    @apply appearance-none rounded leading-tight;
    padding: 0;
    padding: 16px;
    border: 1px solid black;
    color: black;
  }

  .underline {
    text-decoration: underline;
  }

  @media (min-width: 768px) {
    .backgroundBlack {
      background-image: url("/background_black.png");
      background-size: cover;
    }

    .form-container form {
      border: 1px solid grey;
      padding: 40px;
    }
    input {
      border: 1px solid grey;
      color: white;
    }
  }
</style>
