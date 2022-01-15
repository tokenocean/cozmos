<script context="module">
  export async function load({ session }) {
    if (!(session && session.user)) return {
      status: 302,
      redirect: '/login'
    } 

    return {};
  }
</script>

<script>
  import Wallet from './Wallet.svelte';
</script>

<Wallet />
