<script>
  //components
  import SectionHeader from "./SectionHeader.svelte";

  //props
  export let addExpense;
  export let itemName = "";
  export let amount = null;
  export let date = null;
  export let notes = "";
  export let isEditing;
  export let editExpense;
  export let hideForm;
  //variables
  //functions

  const handleSubmit = e => {
    if (isEditing) {
      editExpense({ itemName, amount, date, notes });
    } else {
      addExpense({ itemName, amount, date, notes });
    }
    itemName = "";
    amount = null;
    date = null;
    notes = "";
    hideForm();
  };

  //reactivity
  $: isEmpty = !itemName || !amount;
</script>

<style>
  textarea {
    width: 100%;
  }
</style>

<section class="form">
  <SectionHeader SectionHeader="add expense" />
  <form action="" class="expense-form" on:submit|preventDefault={handleSubmit}>
    <div class="form-control">
      <label for="name">Expense name*</label>
      <input type="text" id="name" bind:value={itemName} />
    </div>
    <div class="form-control">
      <label for="amount">Expense Ammount*</label>
      <input type="number" id="amount" bind:value={amount} />
    </div>
    <div class="form-control">
      <label for="date">Expense Due Date</label>
      <input type="date" id="date" bind:value={date} />
    </div>
    <div class="form-control">
      <label for="notes">Expense Notes</label>
      <textarea type="text" rows="5" col="100" id="notes" bind:value={notes} />
    </div>

    {#if isEmpty}
      <p class="form-empty">*Please fill out required fields</p>
    {/if}
    <button
      type="submit"
      class="btn btn-block btn-primary"
      class:disabled={isEmpty}
      disabled={isEmpty}>

      {#if isEditing}Update expense{:else}Add expense{/if}
    </button>
    <button type="button" class="close-btn" on:click={hideForm}>
      <i class="fas fa-times" />
      close
    </button>
  </form>
</section>
