<script>
  //plugin
  import { getContext } from "svelte";
  import { slide } from "svelte/transition";
  //props
  export let id;
  export let itemName = "Misc";
  export let amount = 0;
  export let date = null;
  export let notes = "";

  //variables
  let displayAmount = false;

  //funtions
  const toggleAmountDisplay = () => (displayAmount = !displayAmount);

  //context
  const removeExpense = getContext("remove");
  const setModifiedExpense = getContext("modify");
</script>

<style type="text/scss" lang="scss">
  h2 {
    font-family: "Roboto", sans-serif;
  }
  button {
    transition: var(--mainTransition);
    color: var(--button);
  }
  button:hover {
    color: var(--buttonHover);
    transform: scale(1.2);
  }
</style>

<article class="single-expense">
  <div class="expense-info">
    <h2>
      {itemName}
      <button class="amount-btn" on:click={toggleAmountDisplay}>
        <i class="fas fa-caret-down" />
      </button>
    </h2>
    {#if displayAmount}
      <h4 transition:slide>
        amount: ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      </h4>
      <h4 transition:slide>due date: {date}</h4>
      <h4 transition:slide>notes: {notes}</h4>
    {/if}
  </div>
  <div class="expense-buttons">
    <button
      class="expense-btn edit-btn"
      on:click={() => setModifiedExpense(id)}>
      <i class="fas fa-pen" />
    </button>
    <button class="expense-btn delete-btn" on:click={() => removeExpense(id)}>
      <i class="fas fa-trash" />
    </button>
  </div>
</article>
