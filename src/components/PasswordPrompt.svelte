<svelte:options accessors={true} />

<script>
  import { tick } from "svelte";
  import { prompt, password, user, token } from "$lib/store";
  import { api } from "$lib/api";
  import { err, dev } from "$lib/utils";
  import Fa from "svelte-fa";
  import Button from "$styleguide/components/Button.svelte";
  import {
    faTimes,
    faEye,
    faEyeSlash,
  } from "@fortawesome/free-solid-svg-icons";

  let attempt = dev ? "liquidart" : "";
  let input;
  let show;
  export const showButtons = true;

  let focus = (p) => p && tick().then(() => input.focus());
  $: focus($prompt);

  export let submit = (e) => {
    api
      .url("/login")
      .post({
        email: $user.username,
        password: attempt,
      })
      .badRequest(err)
      .unauthorized(err)
      .json((r) => {
        $token = r.jwt_token;
        window.sessionStorage.setItem("password", attempt);
        window.sessionStorage.setItem("token", $token);
        $password = attempt;
        $prompt = undefined;
      })
      .catch(err);
  };
</script>

<form on:submit|preventDefault={submit} class="bg-black">
  <div class="dialog-header">
    <h2 id="modal-headline">Enter password</h2>
  </div>
  <div class="mt-2">
    <div class="relative mb-2">
      {#if show}
        <input
          bind:value={attempt}
          placeholder="Password"
          class="w-full"
          bind:this={input}
        />
      {:else}
        <input
          bind:value={attempt}
          placeholder="Password"
          class="w-full"
          type="password"
          bind:this={input}
        />
      {/if}
      <button
        class="flex h-full top-0 absolute px-3 right-0 w-auto text-white"
        type="button"
        on:click|preventDefault|stopPropagation={() => (show = !show)}
      >
        <Fa icon={show ? faEyeSlash : faEye} class="my-auto mr-1" />
      </button>
    </div>
    <div class="text-right text-sm">
      <a href="/forgot-password" class="block w-full text-white"
        >Forgot password?</a
      >
    </div>
    <div class="flex justify-center">
      <Button primary class="m-6 w-48">Cancel</Button>
      <Button primary class="m-6 w-48" type="submit">Continue</Button>
    </div>
  </div>
</form>

<style>
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
  }

  input {
    width: 100%;
    border-radius: 8px;
    border: 1px solid grey;
    background-color: black;
    color: white;
  }

  h2 {
    color: white;
  }
</style>
