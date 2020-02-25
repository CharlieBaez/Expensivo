<script>
  //plugins
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  //components
  import SectionHeader from "./SectionHeader.svelte";
  import Expense from "./Expense.svelte";

  //props
  export let showForm;
  export let expenses = [];
</script>

<style>
  h2 {
    text-transform: capitalize;
  }
  section {
    margin-bottom: 5rem;
  }
  .header-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }
  button {
    background-color: transparent;
    color: var(--button);
    margin-left: auto;
  }
</style>

<section>
  <div class="header-row">
    <SectionHeader SectionHeader="expense list" />
    <button type="button" class="btn-primary" on:click={showForm}>
      <i class="far fa-plus-square" />
      Add a New Expense
    </button>
  </div>
  <ul>
    {#each expenses as expense, index (expense.id)}
      <li
        animate:flip
        in:fly={{ x: 200, delay: index * 100 }}
        out:fly={{ x: -200 }}>
        <Expense {...expense} />
      </li>
    {:else}
      <h2>Currently you have no expenses!</h2>
    {/each}
  </ul>

</section>
