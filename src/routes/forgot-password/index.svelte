<script>
  import { page } from "$app/stores";
  import { api } from "$lib/api";
  import Fa from "svelte-fa";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import Button from "$styleguide/components/Button.svelte";

  let sending;
  let email;
  let forgot = () => {
    window.localStorage.setItem("email", email);
    api.url("/auth/change-password/request").post({ email });
    sending = true;
  };
  let ref;
  let pageChange = () => setTimeout(() => ref && ref.select(), 50);
  $: if (ref) pageChange($page);
</script>

<div class="backgroundBlack px-4 form-container" key={$page.url.pathname}>
  <form
    class="mb-6 rounded-xl md:bg-black w-full xl:w-[30%]"
    on:submit|preventDefault={forgot}
    autocomplete="off"
  >
    <h2 class="mb-8 text-black md:text-white md:text-center">
      Recover Password
    </h2>
    {#if sending}
      <p class="my-4 text-black md:text-white">
        Thank you, please check your email for the recovery link.
      </p>
    {:else}
      <p class="my-4 text-black md:text-white">
        We'll send a recovery link to the email associated with your account.
      </p>
      <div class="flex flex-col mb-4">
        <label class="mb-2 font-medium text-black md:text-white" for="email"
          >Email</label
        >
        <input
          class="bg-transparent md:bg-black"
          placeholder="Email"
          bind:value={email}
          bind:this={ref}
        />
      </div>
      <div class="flex">
        <Button class="ml-auto mb-4 hidden md:block" primary type="submit"
          >Send</Button
        >
        <Button
          class="block md:hidden w-full bg-black rounded-full text-white font-bold"
          type="submit">Send</Button
        >
      </div>
    {/if}
    <a href="/login" class="text-black md:text-white">
      <div class="flex">
        <Fa icon={faChevronLeft} class="my-auto mr-1" />
        <div>Back to sign in</div>
      </div>
    </a>
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
    padding: 10px;
    border: 1px solid black;

    color: black;
    &::placeholder {
      color: black;
    }
  }

  @media (min-width: 768px) {
    .backgroundBlack {
      background-image: url("/background_black.png");
      background-size: cover;
    }
    input {
      border: 1px solid grey;
      background-color: black;
      color: white;
      &::placeholder {
        color: grey;
      }
    }

    .form-container form {
      border: 1px solid grey;
      padding: 40px;
    }
  }
</style>
