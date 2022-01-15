<script>
  import Fa from "svelte-fa";
  import {
    faImage,
    faChevronLeft,
    faEnvelope,
    faLink,
    faMapMarkerAlt,
  } from "@fortawesome/free-solid-svg-icons";
  import { faTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";
  import { onMount } from "svelte";
  import { user, token } from "$lib/store";
  import { err, info, goto, validateEmail } from "$lib/utils";
  import { Avatar } from "$comp";
  import { upload } from "$lib/upload";
  import { updateUser } from "$queries/users";
  import { query } from "$lib/api";
  //import { Dropzone } from "$comp";
  import Button from "$styleguide/components/Button.svelte";

  let initialize = (user) => {
    if (!(form && form.id) && user) form = { ...user };
  };

  $: initialize($user);

  let form;
  let fileInput;
  let filename;
  let preview;
  let file;
  let percent;

  let fileChosen = (e) => {
    file = e.target.files[0];
    if (!file) return;
    filename = file.name;
    var reader = new FileReader();

    reader.onload = async (e) => {
      preview = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  let progress = (event) => {
    percent = Math.round((event.loaded / event.total) * 100);
  };

  let submit = async () => {
    if (file) {
      form.avatar_url = await upload(file, progress);
    }

    if (form.email && !validateEmail(form.email)) return err("Invalid email");

    if (form.twitter) form.twitter = form.twitter.replace(/@/g, "");
    if (form.instagram) form.instagram = form.instagram.replace(/@/g, "");
    if (form.twitch) form.twitch = form.twitch.replace(/@/g, "");
    if (form.discord) form.discord = form.discord.replace(/@/g, "");
    if (form.tiktok) form.tiktok = form.tiktok.replace(/@/g, "");
    if (form.youtube) form.youtube = form.youtube.replace(/@/g, "");
    if (form.facebook) form.facebook = form.facebook.replace(/@/g, "");
    if (form.website) form.website = form.website.replace(/.*:\/\//, "");

    update(form);
  };

  let update = (form) => {
    let {
      is_artist,
      is_admin,
      num_followers,
      num_follows,
      followed,
      id,
      balance,
      pubkey,
      wallet_initialized,
      mnemonic,
      ...rest
    } = form;
    $user = { ...$user, ...rest };

    query(updateUser, { user: rest, id }).then((r) => {
      if (r.error) {
        if (r.error.message.includes("Uniqueness")) err("Username taken");
        else err(r.error);
      } else {
        info("Profile updated");
        goto(`/${rest.username}`);
      }
    });
  };

</script>

<style>
  .container {
    height: auto;
    min-height: 100vh;
    margin: 0;
    max-width: 100%;
  }

  input,
  textarea {
    @apply appearance-none border border-gray-300 rounded py-4 px-3 text-gray-700 leading-tight bg-gray-100;
  }

  div {
    position: relative;
  }

  .box-shadow {
    box-shadow: 6px 5px 12px 2px #ccc;
  }

  h2 {
    font-family: "Zen Dots", cursive;
    font-size: 2em;
    line-height: 1.25em;
  }

  @media only screen and (max-width: 1024px) {
    .container {
      background: none;
      margin-bottom: 200px;
    }
  }

</style>

<div class="px-4 container mx-auto py-5 md:py-20">
  {#if form}
    <div
      class="mb-4 w-full sm:max-w-3xl box-shadow p-4 md:p-10 m-auto lg:flex-row bg-gray-100">
      <a class="block text-black" href={`/${$user.username}`}>
        <div class="flex">
          <Fa icon={faChevronLeft} class="my-auto mr-1" />
          <div>Back</div>
        </div>
      </a>
      <h2 class="mb-6 md:mb-16 text-center">Edit your profile</h2>
      <div class="flex mt-4 m-auto flex-col-reverse lg:flex-row">
        <form
          class="mb-6 flex-grow xl:mr-8"
          on:submit|preventDefault={submit}
          autocomplete="off">
          <p class="font-bold">Enter your details*</p>
          <div class="flex mb-4">
            <input
              id="name"
              placeholder="Name"
              bind:value={form.full_name}
              class="mr-5" />
            <input placeholder="@username" bind:value={form.username} />
          </div>

          <div class="flex flex-col mb-4">
            <p class="font-bold">Enter your email*</p>
            <input placeholder="Email" bind:value={form.email} />
          </div>
          <div class="flex flex-col mb-4">
            <p class="font-bold">Add a short bio.</p>
            <textarea placeholder="Bio" bind:value={form.bio} />
          </div>
          <div class="flex">
            <!--<div>
             <Dropzone on:file={uploadFile(IMG_TYPES.MAIN)} />
					 </div>-->
					 <!--
          </div>
          <div class="flex flex-col mb-4">
            <p class="mb-1 font-bold">
              Verify your profile* -
              <span class="text-sm font-bold">Show the community that your
                profile is authentic.</span>
            </p>
            <div class="md:flex">
              <button
                type="button"
                name="button"
                class="black-box my-4 md:my-0 md:mx-3 rounded-lg">
                <Fa icon={faTwitter} class="mr-3" />Verify via Twitter</button>
              <button
                type="button"
                name="button"
                class="black-box md:mx-3 rounded-lg">
                <Fa icon={faInstagram} class="mr-3" />Verify via Instagram</button>
            </div>-->
          </div>
          <p class="font-bold">Add links to your social media profiles...</p>
					<div class="flex mb-4">
						<p class="black-box w-40 rounded-lg">Twitter</p>
						<input
							placeholder="Twitter username"
							bind:value={form.twitter}
							class="w-full" />
					</div>
					<div class="flex mb-4">
						<p class="black-box w-40 rounded-lg">Instagram</p>
						<input
							placeholder="Instagram username"
							bind:value={form.instagram}
							class="w-full" />
					</div>
          <div class="flex mb-4">
            <p class="black-box w-40 rounded-lg">Website</p>
            <input
              placeholder="Website URL"
              bind:value={form.website}
              class="w-full" />
          </div>
          <div class="flex mb-4">
            <p class="black-box w-40 rounded-lg">YouTube</p>
            <input
              placeholder="Channel URL"
              bind:value={form.youtube}
              class="w-full" />
          </div>
          <div class="flex mb-4">
            <p class="black-box w-40 rounded-lg">Facebook</p>
            <input
              placeholder="Facebook Username"
              bind:value={form.facebook}
              class="w-full" />
          </div>
          <div class="flex mb-4">
            <p class="black-box w-40 rounded-lg">Discord</p>
            <input
              placeholder="Discord Username"
              bind:value={form.discord}
              class="w-full" />
          </div>
          <div class="flex mb-4">
            <p class="black-box w-40 rounded-lg">TikTok</p>
            <input
              placeholder="TikTok Username"
              bind:value={form.tiktok}
              class="w-full" />
          </div>
          <div class="flex mb-4">
            <p class="black-box w-40 rounded-lg">Twitch</p>
            <input
              placeholder="Twitch Username"
              bind:value={form.twitch}
              class="w-full" />
          </div>

          <div class="flex mt-8">
            <Button type="submit" primary class="w-full mt-8">
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>
