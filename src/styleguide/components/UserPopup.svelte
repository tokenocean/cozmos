<script>
  import Fa from "svelte-fa";
  import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
  import { user, token } from "$lib/store";
</script>

<div
  class="z-10 absolute left-1/2 bg-white shadow-md w-80 -ml-40 mt-16 rounded-xl overflow-hidden"
>
  <div class="bg-black p-4 flex items-center justify-between">
    <div class="flex items-center text-white">
      <div class="menu uppercase">
        <a href={`/${$user.username}`} on:click>
          <div class="flex space-x-40 border-b-2">
            <div class="p-2"><span>My profile</span></div>
            <div class="my-auto">
              <Fa icon={faChevronRight} />
            </div>
          </div>
        </a>
        <a href="/logout" class="cursor-pointer">
          <div class="flex space-x-[9.7rem] border-b-2">
            <div class="p-2" on:click><span>Disconnect</span></div>
            <div class="my-auto">
              <Fa icon={faChevronRight} />
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</div>
