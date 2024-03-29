<script context="module">
  import { get } from "$lib/api";
  export async function load({ fetch, params }) {
    try {
      const { subject } = await get(`/${params.username}.json`, fetch);

      return {
        props: {
          subject,
        },
      };
    } catch (e) {
      console.log(e);
      return {
        status: 302,
        redirect: "/",
      };
    }
  }
</script>

<script>
  import Fa from "svelte-fa";
  import {
    faEnvelope,
    faMapMarkerAlt,
  } from "@fortawesome/free-solid-svg-icons";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { user, token } from "$lib/store";
  import { err, goto } from "$lib/utils";
  import { Avatar, Offers, ProgressLinear } from "$comp";
  import { createFollow, deleteFollow } from "$queries/follows";
  import { fade } from "svelte/transition";
  import { query } from "$lib/api";
  import Card from "$styleguide/components/Card.svelte";

  export let id;
  export let subject;

  $: pageChange($page);

  const pageChange = ({ params }) => {
    if (params.id) ({ id } = params);
    else ({ id } = subject);
  };

  let follow = () => {
    if (subject.followed) {
      query(deleteFollow($user, subject)).catch(err);
      subject.followed = false;
      subject.num_followers--;
    } else {
      query(createFollow(subject));
      subject.followed = true;
      subject.num_followers++;
    }
  };

  let tab = "collection";

  let createdRadio;
  let collectedRadio;
  let createdBold = "";
  let collectedBold = "font-bold";
  let createdOpacity = "opacity-60";
  let collectedOpacity = "";
  let coverSource;
</script>

{#if subject.cover_photo_url}
  <div
    class="w-full h-[17.5rem] md:h-96 bg-center bg-cover flex justify-center items-center"
    style="background-image: url({`/api/public/${subject.cover_photo_url}`});"
  />
{:else}
  <div
    class="w-full h-[17.5rem] md:h-96 bg-black flex justify-center items-center"
  />
{/if}
<div class="container mx-auto mb-20 md:mt-20">
  {#if subject}
    <div class="flex justify-between flex-wrap" in:fade>
      <div class="w-full xl:w-1/3 xl:max-w-xs mb-10 md:mb-20 px-2 md:px-0">
        <div>
          <div class="flex-auto flex-col">
            <div class="absolute top-72">
              <div id="avatar-container">
                <img
                  src="/svg_icons/profile_circle.svg"
                  alt="comet"
                  id="avatar-border"
                />
                <div id="avatar">
                  <span class="hidden md:block"
                    ><Avatar size="xl" user={subject} border="null" /></span
                  >
                  <span class="block md:hidden"
                    ><Avatar size="lgx" user={subject} border="null" /></span
                  >
                </div>
              </div>
            </div>
            <div class="ml-[8px] flex items-center mt-20">
              <div class="flex">
                <h3 class="font-bold">@{subject.username}</h3>
              </div>
            </div>
            {#if subject.bio}
              <p class="mt-5 text-sm ml-[8px]">{subject.bio}</p>
            {/if}
          </div>
          <div class="social-details">
            {#if subject.instagram}
              <a
                href={`https://instagram.com/${subject.instagram}`}
                target="_blank"
                rel="noreferrer"
              >
                <div class="flex">
                  <div class="my-auto">
                    <img
                      src="/svg_icons/Instagram-02.svg"
                      alt="Instagram icon"
                      class="w-12"
                    />
                  </div>
                  <div class="self-center">
                    <span>@{subject.instagram}</span>
                  </div>
                </div>
              </a>
            {/if}
            {#if subject.twitter}
              <a
                href={`https://twitter.com/${subject.twitter}`}
                target="_blank"
                rel="noreferrer"
              >
                <div class="flex">
                  <div class="my-auto">
                    <img
                      src="/svg_icons/Twitter-02.svg"
                      alt="Twitter icon"
                      class="w-12"
                    />
                  </div>
                  <div class="self-center">
                    <span>@{subject.twitter}</span>
                  </div>
                </div>
              </a>
            {/if}
            {#if subject.website}
              <a
                href={`https://${subject.website}`}
                target="_blank"
                rel="noreferrer"
              >
                <div class="flex">
                  <div class="my-auto">
                    <img
                      src="/svg_icons/Website.svg"
                      alt="website icon"
                      class="w-12"
                    />
                  </div>
                  <div class="self-center">
                    <span>{subject.website}</span>
                  </div>
                </div>
              </a>
            {/if}
            {#if subject.youtube}
              <a
                href={`https://youtube.com/${subject.youtube}`}
                target="_blank"
                rel="noreferrer"
              >
                <div class="flex">
                  <div class="my-auto">
                    <img
                      src="/svg_icons/Youtube.svg"
                      alt="YouTube icon"
                      class="w-12"
                    />
                  </div>
                  <div class="self-center">
                    <span>@{subject.youtube}</span>
                  </div>
                </div>
              </a>
            {/if}
            {#if subject.facebook}
              <a
                href={`https://facebook.com/${subject.facebook}`}
                target="_blank"
                rel="noreferrer"
              >
                <div class="flex">
                  <div class="my-auto">
                    <img
                      src="/svg_icons/Facebook-02.svg"
                      alt="Facebook icon"
                      class="w-12"
                    />
                  </div>
                  <div class="self-center">
                    <span>@{subject.facebook}</span>
                  </div>
                </div>
              </a>
            {/if}
            {#if subject.discord}
              <a href={`https://discord.com`} target="_blank" rel="noreferrer">
                <div class="flex">
                  <div class="my-auto">
                    <img
                      src="/svg_icons/Discord.svg"
                      alt="Discord icon"
                      class="w-12"
                    />
                  </div>
                  <div class="self-center">
                    <span>@{subject.discord}</span>
                  </div>
                </div>
              </a>
            {/if}
            {#if subject.tiktok}
              <a
                href={`https://tiktok.com/@${subject.tiktok}`}
                target="_blank"
                rel="noreferrer"
              >
                <div class="flex">
                  <div class="my-auto">
                    <img
                      src="/svg_icons/Tik-tok.svg"
                      alt="TikTok icon"
                      class="w-12"
                    />
                  </div>
                  <div class="self-center">
                    <span>@{subject.tiktok}</span>
                  </div>
                </div>
              </a>
            {/if}
            {#if subject.twitch}
              <a
                href={`https://twitch.com/${subject.twitch}`}
                target="_blank"
                rel="noreferrer"
              >
                <div class="flex">
                  <div class="my-auto">
                    <img
                      src="/svg_icons/Twitch.svg"
                      alt="Twitch icon"
                      class="w-12"
                    />
                  </div>
                  <div class="self-center">
                    <span>@{subject.twitch}</span>
                  </div>
                </div>
              </a>
            {/if}
          </div>
          <div
            class="px-2 md:px-0 text-sm flex md:justify-start justify-center mt-5"
          >
            <div
              class="text-center w-full mr-3 border rounded-full py-2 px-5 border-solid border-black"
            >
              Followers:
              {subject.num_followers}
            </div>
            <div
              class="text-center w-full border rounded-full py-2 px-5 border-solid border-black"
            >
              Following:
              {subject.num_follows}
            </div>
          </div>
          <div
            class="px-2 md:px-0 w-full mt-3 md:justify-start justify-center flex md:block"
          >
            {#if $user}
              {#if $user.id === subject.id}
                <a
                  class="primary-btn w-full text-sm"
                  href={`/${$user.username}/edit`}>Edit Profile</a
                >
              {/if}
            {/if}
          </div>
          <div class="mt-5 md:mr-6">
            {#if $user}
              {#if !($user.id === subject.id)}
                <button
                  class="p-2 primary-btn follow mt-8 w-2/3 md:w-full mx-auto text-sm"
                  on:click={follow}
                >
                  {subject.followed ? "Unfollow" : "Follow"}</button
                >
              {/if}
            {/if}
          </div>
        </div>
      </div>

      <div class="w-full xl:w-2/3 mb-10 md:mb-0">
        <div class="flex justify-center items-center">
          <div
            class="block md:flex justify-center text-center tabs flex-wrap mb-14 space-y-4 md:space-y-0"
          >
            {#if subject.is_artist}
              <div
                class="cursor-pointer flex"
                on:click={() => {
                  tab = "creations";
                  createdRadio.src = "/svg_icons/comet.svg";
                  collectedRadio.src = "svg_icons/comet-02.svg";
                  createdBold = "font-bold";
                  collectedBold = "";
                  createdOpacity = "";
                  collectedOpacity = "opacity-60";
                }}
              >
                <img
                  src="/svg_icons/comet-02.svg"
                  alt="comet icon"
                  bind:this={createdRadio}
                  class={createdOpacity}
                />

                <span
                  class="cursor-pointer self-center ml-2 {createdBold} {createdOpacity}"
                  >Created</span
                >
              </div>
            {/if}
            <div
              class="cursor-pointer flex"
              on:click={() => {
                tab = "collection";
                createdRadio.src = "/svg_icons/comet-02.svg";
                collectedRadio.src = "svg_icons/comet.svg";
                createdBold = "";
                collectedBold = "font-bold";
                createdOpacity = "opacity-60";
                collectedOpacity = "";
              }}
            >
              <img
                src="/svg_icons/comet.svg"
                alt="comet icon"
                bind:this={collectedRadio}
                class={collectedOpacity}
              />

              <span
                class="cursor-pointer self-center ml-2 {collectedBold} {collectedOpacity}"
                >Collected</span
              >
            </div>
          </div>
        </div>
        {#if tab === "creations"}
          <div class="w-full justify-center">
            <div class="w-full max-w-sm mx-auto mb-12">
              {#if $user && $user.is_artist && $user.id === subject.id}
                <a href="/a/create" class="primary-btn"
                  >Submit a new experience</a
                >
              {/if}
            </div>
            <div class="w-full flex flex-wrap">
              {#each subject.creations as artwork (artwork.id)}
                <div class="gallery-tab w-full lg:w-1/2 px-4 mb-10">
                  <Card {artwork} />
                </div>
              {:else}
                <div class="mx-auto">No creations yet</div>
              {/each}
            </div>
          </div>
        {:else if tab === "collection"}
          <div class="w-full flex justify-center">
            <div class="w-full flex flex-wrap">
              {#each subject.holdings as artwork (artwork.id)}
                <div class="gallery-tab w-full lg:w-1/2 px-4 mb-10">
                  <Card {artwork} />
                </div>
              {:else}
                <div class="mx-auto">Nothing collected yet</div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <ProgressLinear app={true} />
  {/if}
</div>

<style>
  .gallery-tab :global(.card-link img),
  .gallery-tab :global(.card-link video) {
    height: 350px;
  }

  .tabs div {
    @apply mb-auto h-10 mx-2 md:mx-4;
  }

  .social-details {
    display: flex;
    flex-direction: column;
  }
  .social-details a {
    margin-top: 5px;
  }

  .social-details span {
    margin-left: 8px;
    color: black;
  }

  #avatar-container {
    position: relative;
  }

  #avatar-border {
    width: 108px;
  }

  #avatar {
    position: absolute;
    top: 14px;
    left: 14px;
  }
  @media (min-width: 768px) {
    #avatar-border {
      width: 100%;
    }

    #avatar {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>
