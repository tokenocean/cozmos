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
    class="h-[100vh] md:h-auto mt-10 md:mt-0 mb-6 rounded-xl md:bg-black w-full xl:w-[30%]"
    on:submit|preventDefault={submit}
    autocomplete="off"
  >
    {#if loading}
      <ProgressLinear />
    {:else if registered}
      <h2 class="mb-8 text-black md:text-white text-center">Registered!</h2>
      <p class="text-black md:text-white text-center">
        Thanks for registering. Please check your email for an activation link.
      </p>
      <img
        src="/svg_icons/01-Isotype Cozmos.svg"
        alt=""
        class="linkIcon mx-auto"
      />
      <Button primary class="mx-auto hidden md:block p-2" height="">
        <a href="/login">Sign In</a></Button
      >
      <Button
        class="block md:hidden w-full bg-black rounded-full text-white font-bold"
        ><a href="/login">Sign In</a></Button
      >
    {:else}
      <h2 class="mb-8 text-black md:text-white md:text-center text-5xl">
        Sign Up
      </h2>
      <div class="flex flex-col mb-4">
        <label
          class="mb-2 font-medium text-black md:text-white"
          for="first_name">Email</label
        >
        <input
          id="email"
          name="email"
          placeholder="Email"
          class="bg-transparent md:bg-black"
          bind:value={email}
          bind:this={ref}
        />
      </div>
      <div class="flex flex-col mb-4">
        <label
          class="mb-2 font-medium text-black md:text-white"
          for="first_name">Username</label
        >
        <input
          id="username"
          name="username"
          placeholder="Username"
          class="bg-transparent md:bg-black"
          autocapitalize="off"
          bind:value={username}
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
              id="password"
              name="password"
              placeholder="At least 8 characters."
            />
          {:else}
            <input
              class="w-full bg-transparent md:bg-black"
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
            <Fa
              icon={show ? faEyeSlash : faEye}
              class="my-auto mr-1 text-black md:text-white"
            />
          </button>
        </div>
      </div>
      <span class="block w-full text-black md:text-white text-sm"
        >By signing up, you agree to the
        <a href="/terms-and-conditions">Terms and Conditions</a>
        and
        <a href="/privacy-policy">Privacy Policy</a></span
      >
      <div class="flex my-5 justify-end">
        <Button primary class="w-full hidden md:block" type="submit"
          >Register</Button
        >
        <Button
          class="block md:hidden w-full bg-black rounded-full text-white font-bold"
          type="submit">Register</Button
        >
      </div>

      <a href="/login" class="text-black md:text-white">
        Already have an account? <span class="underline">Sign in</span></a
      >
    {/if}
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
    @apply appearance-none rounded text-gray-700 leading-tight;
    padding: 0;
    padding: 16px;
    border: 1px solid black;
    color: black;
    &::placeholder {
      color: black;
    }
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

  @media (min-width: 768px) {
    .backgroundBlack {
      background-image: url("/background_black.png");
      background-size: cover;
    }

    input {
      border: 1px solid grey;
      color: white;
      background-color: black;
      &::placeholder {
        color: white;
      }
    }
    .form-container form {
      border: 1px solid grey;
      padding: 40px;
    }
  }
</style>
