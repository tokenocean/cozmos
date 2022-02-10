<script>
  import Fa from "svelte-fa";
  import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
  import { err, dev } from "$lib/utils";
  import { page } from "$app/stores";
  import { register } from "$lib/register";
  import { ProgressLinear } from "$comp";
  import Button from "$styleguide/components/Button.svelte";

  let show;
  let username = "";
  let password = dev ? "liquidart" : "";
  let email = dev ? makeid(6) + "@a.com" : "";
  let registered;

  function makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  let ref;
  let pageChange = () => setTimeout(() => ref && ref.select(), 50);
  $: if (ref) pageChange($page);

  let loading;
  let submit = async () => {
    loading = true;

    try {
      await register(email, username, password);
      registered = true;
    } catch (e) {
      err(e);
    }

    loading = false;
  };
</script>

<div class="backgroundBlack form-container px-4">
  <form
    class="mb-6 bg-black rounded-xl"
    on:submit|preventDefault={submit}
    autocomplete="off"
  >
    {#if loading}
      <ProgressLinear />
    {:else if registered}
      <h2 class="mb-8 text-white">Registered!</h2>
      <p class="text-white text-center">
        Thanks for registering. Please check your email for an activation link.
      </p>
      <img
        src="/svg_icons/01-Isotype Cozmos.svg"
        alt=""
        class="linkIcon mx-auto"
      />
      <Button primary class="mx-auto">
        <a href="/login">Continue to sign in page</a></Button
      >
    {:else}
      <h2 class="mb-8 text-white">Sign Up</h2>
      <div class="flex flex-col mb-4">
        <label class="mb-2 font-medium text-white" for="first_name">Email</label
        >
        <input
          id="email"
          name="email"
          placeholder="Email"
          bind:value={email}
          bind:this={ref}
        />
      </div>
      <div class="flex flex-col mb-4">
        <label class="mb-2 font-medium text-white" for="first_name"
          >Username</label
        >
        <input
          id="username"
          name="username"
          placeholder="Username"
          autocapitalize="off"
          bind:value={username}
        />
      </div>
      <div class="flex flex-col mb-4">
        <label class="mb-2 font-medium text-white" for="last_name"
          >Password</label
        >
        <div class="relative">
          {#if show}
            <input
              class="w-full"
              bind:value={password}
              autocapitalize="off"
              id="password"
              name="password"
              placeholder="At least 8 characters."
            />
          {:else}
            <input
              class="w-full"
              type="password"
              bind:value={password}
              autocapitalize="off"
              id="password"
              name="password"
              placeholder="At least 8 characters."
            />
          {/if}
          <button
            class="absolute h-full px-3 right-0 top-0 w-auto text-white"
            type="button"
            on:click|preventDefault|stopPropagation={() => (show = !show)}
          >
            <Fa icon={show ? faEyeSlash : faEye} class="my-auto mr-1" />
          </button>
        </div>
      </div>
      <span class="block w-full text-white text-sm"
        >By signing up, you agree to the
        <a href="/terms-and-conditions">Terms and Conditions</a>
        and
        <a href="/privacy-policy">Privacy Policy</a></span
      >
      <div class="flex my-5 justify-end">
        <Button primary class="w-full" type="submit">Register</Button>
      </div>

      <a href="/login" class="text-white">
        Already have an account? <span class="underline">Sign in</span></a
      >
    {/if}
  </form>
</div>

<style>
  .backgroundBlack {
    background-image: url("/background_black.png");
    background-size: cover;
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
    width: 100%;
    max-width: 450px;
    padding: 40px;
    border: 1px solid white;
  }

  input {
    @apply appearance-none rounded text-gray-700 leading-tight;
    padding: 0;
    padding: 10px;
    border: 1px solid grey;
    color: white;
    background-color: black;
  }

  span {
    cursor: pointer;
  }

  .underline {
    text-decoration: underline;
  }

  .linkIcon {
    width: 15rem;
  }
</style>
