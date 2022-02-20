<script>
  import { goto } from "$lib/utils";
  import { prompt } from "$lib/store";
  let register = () => {
    goto("/register");
    $prompt = undefined;
  };
</script>

<div
  class="container text-left md:text-center text-black py-[10rem] md:p-10 z-100"
>
  <h2 class="mb-6 text-3xl text-black">Create your wallet</h2>
  <p>
    By creating your wallet, you agree to our
    <a href="/terms-and-conditions">Terms and Conditions</a>
    and
    <a href="/privacy-policy">Privacy Policy</a>.
  </p>

  <button
    type="button"
    name="button"
    disabled
    class="bg-black block mx-auto sm:w-full md:w-5/6 md:h-16 mt-8 mb-4 rounded-full text-black font-bold marina flex items-center md:text-xl"
    ><img src="/Marina_black.png" alt="Marina icon" class="w-20 mr-4" />
    <div>
      Marina - Liquid Wallet<br /><span class="text-sm"
        >&#11835;&#11835;&#11835; Coming soon</span
      >
    </div></button
  >
  <button
    type="button"
    name="button"
    class="bg-black block mx-auto sm:w-full md:w-5/6 md:h-16  rounded-full text-white font-bold flex items-center md:text-xl"
    on:click={register}
    ><img src="/svg_icons/Logo.svg" alt="coinos icon" class="w-20 mr-4" />Create
    one with us</button
  >
</div>

<style>
  .marina {
    background-color: #24969c;
  }
</style>
