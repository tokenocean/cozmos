<script>
  import { createEventDispatcher } from "svelte";
  import { royaltyRecipientIndividualType, err } from "$lib/utils";
  const dispatch = createEventDispatcher();

  export let defaultName;
  export let defaultAddress;

  const recipientModel = {
    name: "",
    amount: 1,
    address: "",
    type: royaltyRecipientIndividualType,
  };

  let recipient = {
    ...recipientModel,
    ...{ address: defaultAddress, name: defaultName },
  };

  const onSubmit = (e) => {
    if (!recipient.name.length)
      return err("Please enter a name for the recipient.");
    if (recipient.amount <= 0)
      return err("Please enter an amount percentage for the recipient.");
    if (!recipient.address)
      return err("Please enter an address for the recipient.");

    dispatch("addrecipient", {
      newRecipient: recipient,
      cb: () => {
        recipient = { ...recipientModel };
      },
    });
  };
</script>

<form
  class="w-full mb-6 mt-6"
  autocomplete="off"
  on:submit|preventDefault={onSubmit}
>
  <div class="flex flex-wrap w-full mb-4">
    <div class="mt-1 rounded-md md:w-4/5 w-full md:pr-6">
      <label for="recipientName" class="font-normal">Name</label>
      <input
        class="form-input block w-full pl-4 pr-4 bg-transparent border border-gray-300"
        type="text"
        bind:value={recipient.name}
        placeholder="Recipient Name"
        id="recipientName"
      />
    </div>
    <div class="mt-1 rounded-md md:w-1/5 w-1/2">
      <label for="recipientAmount" class="font-normal">Rate (%)</label>
      <input
        class="form-input block w-full pl-4 pr-1 bg-transparent border border-gray-300"
        type="number"
        step="1"
        min="1"
        max="10"
        bind:value={recipient.amount}
        placeholder="Amount Percent"
        id="recipientAmount"
      />
    </div>
  </div>
  <div class="flex w-full mb-4">
    <div class="mt-1 rounded-md w-4/5 pr-6">
      <label for="recipientAddress" class="font-normal">Address</label>
      <input
        class="form-input block w-full pl-4 pr-4 bg-transparent border border-gray-300"
        type="text"
        bind:value={recipient.address}
        placeholder="Recipient Address"
        id="recipientAddress"
      />
    </div>
    <div class="mt-1 rounded-md pt-8">
      <input
        type="submit"
        class="bg-black text-white font-bold btn-sm cursor-pointer mx-auto overflow-hidden"
        value="Add Recipient"
      />
    </div>
  </div>
</form>

<style>
  input[type="submit"] {
    height: 54px;
    font-size: 0.9rem;
  }

  input {
    @apply rounded-lg mb-4 mt-2;
    &:disabled {
      @apply bg-gray-100;
    }
  }
</style>
