<script>
  export let artwork;

  let experience = artwork.title;
  let image = `/api/ipfs/${artwork.main[0].hash}`;
</script>

<div class="h-[100vh] md:h-auto container text-center p-10">
  <div class="flex justify-center">
    <h1
      class="text-3xl font-extrabold text-transparent bg-clip-text text-gradient"
    >
      Congratulations!
    </h1>
  </div>
  <p class="text-xl mt-4">You just purchased {experience}.</p>
  <img
    src={image}
    alt={experience}
    class="w-120 md:w-90 md:h-60 mx-auto rounded-t-3xl mt-10 object-cover"
  />
  <div class="border-t-2 border-gray-400 block md:flex justify-center">
    <div class="flex mt-5 md:mt-10">
      <a
        href="https://instagram.com/cozmosnft"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="/svg_icons/Instagram-02.svg"
          alt="Instagram"
          class="w-52 md:w-16"
        />
      </a>
      <a href="https://discord.com/cozmosnft" target="_blank" rel="noreferrer">
        <img src="/svg_icons/Discord.svg" alt="Discord" class="w-52 md:w-16" />
      </a>
      <a href="https://twitter.com/cozmosnft" target="_blank" rel="noreferrer">
        <img
          src="/svg_icons/Twitter-02.svg"
          alt="Twitter"
          class="w-52 md:w-16"
        />
      </a>
    </div>
    <p class="self-center text-sm md:ml-16 md:mt-10">Follow us for updates</p>
  </div>
</div>
