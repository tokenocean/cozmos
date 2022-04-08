import { tick } from "svelte";
import { sighash, psbt } from "$lib/store";
import { get } from "svelte/store";
import { sign } from "$lib/wallet";
import { requirePassword } from "$lib/auth";

export default async (promptSign = true) => {
  await requirePassword();
  psbt.set(sign(get(sighash) || 1, promptSign));
  await tick();
};
