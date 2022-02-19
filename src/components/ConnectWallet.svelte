<script>
  import { goto } from "$lib/utils";
  import { prompt } from "$lib/store";
  let register = () => {
    goto("/register");
    $prompt = undefined;
  };
</script>

<div class="container text-center bg-white py-[4.5rem] md:p-10 z-100">
  <h2 class="mb-6 text-3xl">Create your wallet</h2>
  <p>
    By creating your wallet, you agree to our
    <a href="/terms-and-conditions">Terms and Conditions</a>
    and
    <a href="/privacy-policy">Privacy Policy</a>.
  </p>

  <button
    type="button"
    name="button"
    class="bg-black block mx-auto sm:w-full md:w-5/6 md:h-16 mt-8 mb-4 rounded-lg text-white font-bold flex items-center md:text-xl"
    on:click={register}
    ><img src="/svg_icons/Logo.svg" alt="coinos icon" class="w-20 mr-4" />Create
    one with us</button
  >
  <button
    type="button"
    name="button"
    disabled
    class="bg-black block mx-auto sm:w-full md:w-5/6 md:h-16 rounded-lg text-white font-bold marina flex items-center md:text-xl"
    ><img src="/svg_icons/Marina.svg" alt="Marina icon" class="w-20 mr-4" />
    <div>
      Marina - Liquid Wallet<br /><span class="text-sm"
        >&#11835;&#11835;&#11835; Coming soon</span
      >
    </div></button
  >
  <div class="block md:flex justify-center">
    <div class="flex mt-5 md:mt-10">
      <a
        href="https://instagram.com/cozmosnft"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="/svg_icons/Instagram-02.svg"
          alt="Instagram icon"
          class="w-52 md:w-16"
        />
      </a>
      <a href="https://discord.com/cozmosnft" target="_blank" rel="noreferrer">
        <img
          src="/svg_icons/Discord.svg"
          alt="Discord icon"
          class="w-52 md:w-16"
        />
      </a>
      <a href="https://twitter.com/cozmosnft" target="_blank" rel="noreferrer">
        <img
          src="/svg_icons/Twitter-02.svg"
          alt="Twitter icon"
          class="w-52 md:w-16"
        />
      </a>
    </div>
    <p class="self-center text-sm md:ml-16 md:mt-10">Follow us for updates</p>
  </div>
</div>

<style>
  .marina {
    background-color: #24969c;
  }
</style>
