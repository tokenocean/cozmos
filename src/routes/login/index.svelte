<script>
  import { user, token } from "$lib/store";
  import goto from "$lib/goto";
  import { api, gql } from "$lib/api";
  import decode from "jwt-decode";

  let error;
  let username = "anon";
  let password = "liquidart";

  let login = () => {
    api
      .url("/auth/login")
      .post({
        email: `${username}@liquidart.com`,
        password,
      })
      .badRequest((err) => {
        error = JSON.parse(err.message).message;
      })
      .unauthorized((err) => (error = "Login failed"))
      .json((r) => {
        $token = r.jwt_token;
        window.sessionStorage.setItem("token", $token);

        goto("/market");
      });
  };

  let register = () => {
    api
      .url("/auth/register")
      .post({
        email: `${username}@liquidart.com`,
        password,
        user_data: { 
          username,
          full_name: username,
        },
      })
      .badRequest((err) => {
        error = JSON.parse(err.message).message;
      })
      .res(login);
  };
</script>

<style>
  input {
    @apply shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight;
  }

  button {
    @apply border shadow px-4 py-2;
  }
</style>

{#if error}
  <div
    class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
    role="alert">
    <strong class="font-bold">Error!</strong>
    <span class="block sm:inline">{error}</span>
  </div>
{/if}

<form class="mb-6" on:submit|preventDefault={login} autocomplete="off">
  <div class="flex flex-col mb-4">
    <label
      class="mb-2 uppercase font-medium text-gray-600"
      for="first_name">Username</label>
    <input placeholder="username" bind:value={username} />
  </div>
  <div class="flex flex-col mb-4">
    <label
      class="mb-2 uppercase font-medium text-gray-600"
      for="last_name">Password</label>
    <input placeholder="Password" type="password" bind:value={password} />
  </div>
  <div class="flex">
    <button
      class="block bg-teal-600 hover:bg-teal-dark text-white uppercase text-lg mx-auto p-4 rounded flex-1 ml-1"
      type="submit">Login</button>
    <button
      on:click|preventDefault={register}
      class="block bg-teal-400 hover:bg-teal-dark text-white uppercase text-lg mx-auto p-4 rounded flex-1">Register</button>
  </div>
</form>