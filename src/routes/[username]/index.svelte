<script context="module">
  export async function load({ fetch, page }) {
    try {
      const { subject } = await fetch(`/${page.params.username}.json`).then(
        (r) => {
          if (r.ok) return r.json();
          throw new Error("not ok");
        }
      );

      return {
        maxage: 90,
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
  import Menu from "./_menu.svelte";
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

</script>

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
    margin-top: 15px;
  }

  .social-details span {
    margin-left: 8px;
    color: black;
  }

  #line-right {
    border-right: 1px solid black;
  }

  #avatar-container {
    position: relative;
  }

  #avatar-border {
    width: 100%;
  }

  #avatar {
    position: absolute;
    top: 50%;
    left: 48.5%;
    transform: translate(-50%, -50%);
  }

  #favorites,
  #collection,
  #creations,
  #offers {
    display: none;
  }

</style>

<div class="container mx-auto lg:px-16 mt-5 md:mt-20">
  {#if subject}
    <div class="flex justify-between flex-wrap" in:fade>
      <div class="w-full xl:w-1/3 xl:max-w-xs mb-20">
        <div id="line-right">
          <div>
            <div class="flex-auto flex-col">
              <div id="avatar-container">
                <img
                  src="/svg_icons/comet-02.svg"
                  alt="comet"
                  id="avatar-border" />
                <div id="avatar">
                  <Avatar size="xl" user={subject} />
                </div>
              </div>
              <div class="flex items-center">
                <div class="flex">
                  <h3>@{subject.username}</h3>
                </div>
              </div>
              {#if subject.bio}
                <p class="mt-5">{subject.bio}</p>
              {/if}
            </div>
            <div class="social-details">
              {#if subject.instagram}
                <a href={`https://instagram.com/${subject.instagram}`}>
                  <div class="flex">
                    <div class="my-auto">
                      <img
                        src="/svg_icons/Instagram-02.svg"
                        alt="Instagram icon"
                        class="w-12" />
                    </div>
                    <div class="self-center">
                      <span>@{subject.instagram}</span>
                    </div>
                  </div>
                </a>
              {/if}
              {#if subject.twitter}
                <a href={`https://twitter.com/${subject.twitter}`}>
                  <div class="flex">
                    <div class="my-auto">
                      <img
                        src="/svg_icons/Twitter-02.svg"
                        alt="Twitter icon"
                        class="w-12" />
                    </div>
                    <div class="self-center">
                      <span>@{subject.twitter}</span>
                    </div>
                  </div>
                </a>
              {/if}
              <!--
              {#if subject.email}
                <a href={`mailto:${subject.email}`}>
                  <div class="flex">
                    <div class="my-auto">
                      <Fa icon={faEnvelope} class='w-12'/>
                    </div>
                    <div><span>{subject.email}</span></div>
                  </div>
                </a>
              {/if}
							-->
              {#if subject.website}
                <a href={`https://${subject.website}`}>
                  <div class="flex">
                    <div class="my-auto">
                      <img
                        src="/svg_icons/Website.svg"
                        alt="website icon"
                        class="w-12" />
                    </div>
                    <div class="self-center">
                      <span>{subject.website}</span>
                    </div>
                  </div>
                </a>
              {/if}
							{#if subject.youtube}
								<a href={`https://${subject.youtube}`}>
									<div class="flex">
										<div class="my-auto">
											<img
												src="/svg_icons/Youtube.svg"
												alt="YouTube icon"
												class="w-12" />
										</div>
										<div class="self-center">
											<span>@{subject.youtube}</span>
										</div>
									</div>
								</a>
							{/if}
							{#if subject.facebook}
								<a href={`https://${subject.facebook}`}>
									<div class="flex">
										<div class="my-auto">
											<img
												src="/svg_icons/Facebook-02.svg"
												alt="Facebook icon"
												class="w-12" />
										</div>
										<div class="self-center">
											<span>@{subject.facebook}</span>
										</div>
									</div>
								</a>
							{/if}
							{#if subject.discord}
								<a href={`https://${subject.discord}`}>
									<div class="flex">
										<div class="my-auto">
											<img
												src="/svg_icons/Discord.svg"
												alt="Discord icon"
												class="w-12" />
										</div>
										<div class="self-center">
											<span>@{subject.discord}</span>
										</div>
									</div>
								</a>
							{/if}
							{#if subject.tiktok}
								<a href={`https://${subject.tiktok}`}>
									<div class="flex">
										<div class="my-auto">
											<img
												src="/svg_icons/Tik-tok.svg"
												alt="TikTok icon"
												class="w-12" />
										</div>
										<div class="self-center">
											<span>@{subject.tiktok}</span>
										</div>
									</div>
								</a>
							{/if}
							{#if subject.twitch}
								<a href={`https://${subject.twitch}`}>
									<div class="flex">
										<div class="my-auto">
											<img
												src="/svg_icons/Twitch.svg"
												alt="Twitch icon"
												class="w-12" />
										</div>
										<div class="self-center">
											<span>@{subject.twitch}</span>
										</div>
									</div>
								</a>
							{/if}
              <!--
              {#if subject.location}
                <a href=".">
                  <div class="flex">
                    <div class="my-auto">
                      <Fa icon={faMapMarkerAlt} class='w-12'/>
                    </div>
                    <div><span>{subject.location}</span></div>
                  </div>
                </a>
              {/if}
							-->
            </div>
            <div class="flex mt-5">
              <div
                class="mr-3 border rounded-full py-2 px-5 border-solid border-black">
                Followers:
                {subject.num_followers}
              </div>
              <div
                class="border rounded-full py-2 px-5 border-solid border-black">
                Following:
                {subject.num_follows}
              </div>
            </div>
						<div class='mt-3'>
						{#if $user}
							<a
								class="primary-btn mr-6"
								href={`/${$user.username}/edit`}>Edit Profile</a>
						{/if}
						</div>
            <div class="mt-5 mr-6">
              {#if $user}
                {#if $user.id === subject.id}
                	 <Menu />
                {:else}
                  <button class="p-2 primary-btn follow mt-8 w-full" on:click={follow}>
                    {subject.followed ? 'Unfollow' : 'Follow'}</button>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      </div>

      <div class="w-full xl:w-2/3">
        <div class="flex justify-center text-center tabs flex-wrap mb-14">
          {#if subject.is_artist}
            <div class="cursor-pointer flex" on:click={() => {
							tab = 'creations';
							createdRadio.src = '/svg_icons/comet.svg';
							collectedRadio.src = 'svg_icons/comet-02.svg';
						}}>
              <img
                src="/svg_icons/comet-02.svg"
                alt="comet icon"
                bind:this={createdRadio} />
              <input
                type="radio"
                id="creations"
                name="radio"
                class="cursor-pointer"
                checked
                class:hover={tab === 'creations'}
               />
              <label for="creations" class="cursor-pointer">Created</label>
            </div>
          {/if}
          <div class="cursor-pointer flex" on:click={() => {
						tab = 'collection';
						createdRadio.src = '/svg_icons/comet-02.svg';
						collectedRadio.src = 'svg_icons/comet.svg';
					}}>
            <img
              src="/svg_icons/comet.svg"
              alt="comet icon"
              bind:this={collectedRadio} />
            <input
              type="radio"
              id="collection"
              name="radio"
              class="cursor-pointer"
              class:hover={tab === 'collection'}
             />
            <label for="collection" class="cursor-pointer">Collected</label>
          </div>
          <!--
					{#if $user && $user.id === id}
            <div class="cursor-pointer">
              <input
                type="radio"
                id="offers"
                name="radio"
                class="cursor-pointer"
                class:hover={tab === 'offers'}
                on:click={() => (tab = 'offers')} />
              <label for="offers" class="cursor-pointer">Offers</label>
            </div>
            <div class="cursor-pointer">
              <input
                type="radio"
                id="favorites"
                name="radio"
                class="cursor-pointer"
                class:hover={tab === 'favorites'}
                on:click={() => (tab = 'favorites')} />
              <label for="favorites" class="cursor-pointer">Favorites</label>
            </div>
          {/if}
					-->
        </div>
        {#if tab === 'creations'}
          <div class="w-full justify-center">
            <div class="w-full max-w-sm mx-auto mb-12">
              {#if $user && $user.is_artist && $user.id === subject.id}
                <a href="/a/create" class="primary-btn">Submit a new artwork</a>
              {/if}
            </div>
            <div class="w-full flex flex-wrap">
              {#each subject.creations as artwork (artwork.id)}
                <div class="gallery-tab w-full lg:w-1/2 px-5 mb-10">
                  <Card {artwork} />
                </div>
              {:else}
                <div class="mx-auto">No creations yet</div>
              {/each}
            </div>
          </div>
        {:else if tab === 'collection'}
          <div class="w-full flex justify-center">
            <div class="w-full flex flex-wrap">
              {#each subject.holdings as artwork (artwork.id)}
                <div class="gallery-tab w-full lg:w-1/2 px-5 mb-10">
                  <Card {artwork} />
                </div>
              {:else}
                <div class="mx-auto">Nothing collected yet</div>
              {/each}
            </div>
          </div>
        {:else if tab === 'offers'}
          <Offers offers={subject.offers} />
        {:else}
          <div class="w-full flex justify-center">
            <div class="w-full flex flex-wrap">
              {#each subject.favorites as { artwork } (artwork.id)}
                <div class="gallery-tab w-full lg:w-1/2 px-0 md:px-5 mb-10">
                  <Card {artwork} />
                </div>
              {:else}
                <div class="mx-auto">No favorites yet</div>
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
