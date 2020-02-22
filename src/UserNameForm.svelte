<script>
  //plugin
  import { getContext } from "svelte";
  //components
  import SectionHeader from "./SectionHeader.svelte";

  //props
  export let userName = "";
  export let email = "";
  export let isEditing;
  export let addUserInfo;
  export let hideUserForm;

  const handleSubmit = e => {
    addUserInfo({ userName, email });
    hideUserForm();
  };

  //reactivity
  $: isEmpty = !userName || !email;
</script>

<style>

</style>

<section class="form">
  <SectionHeader SectionHeader="Tell us about yourself" />
  <form action="" class="expense-form" on:submit|preventDefault={handleSubmit}>
    <div class="form-control">
      <label for="username">name*</label>
      <input type="text" id="username" bind:value={userName} />
    </div>
    <div class="form-control">
      <label for="email">Email*</label>
      <input type="email" id="date" bind:value={email} />
    </div>

    {#if isEmpty}
      <p class="form-empty">*please fill out required fields</p>
    {/if}
    <button
      type="submit"
      class="btn btn-block btn-primary"
      class:disabled={isEmpty}
      disabled={isEmpty}>

      {#if isEditing}Update User Info{:else}Add User Info{/if}
    </button>
    <button type="button" class="close-btn" on:click={hideUserForm}>
      <i class="fas fa-times" />
      close
    </button>
  </form>
</section>
