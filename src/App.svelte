<script>
  //plugins
  import { setContext, onMount, afterUpdate } from "svelte";

  //components
  import Navbar from "./Navbar.svelte";
  import UserModal from "./UserModal.svelte";
  import UserNameForm from "./UserNameForm.svelte";
  import Greeting from "./Greeting.svelte";
  import ExpensesList from "./ExpensesList.svelte";
  import Totals from "./Totals.svelte";
  import ExpenseForm from "./ExpenseForm.svelte";
  import Modal from "./Modal.svelte";

  //data,loaclStorage management
  const setLocalStorage = () => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("UserInfoName", JSON.stringify(UserInfoName));
  };
  onMount(() => {
    expenses = localStorage.getItem("expenses")
      ? JSON.parse(localStorage.getItem("expenses"))
      : [];
    UserInfoName = localStorage.getItem("UserInfoName")
      ? JSON.parse(localStorage.getItem("UserInfoName"))
      : "";
    UserForm = localStorage.getItem("UserInfoName") ? false : true;
  });
  afterUpdate(() => {
    setLocalStorage();
  });

  //variables
  let expenses = [];
  let UserInfoName = "";
  let setItemName = "";
  let setAmount = null;
  let setDate = null;
  let setNotes = "";
  let setId = null;
  let isFormOpen = false;
  let UserForm = false;
  //functions
  const showUserForm = () => (UserForm = true);
  const hideUserForm = () => {
    UserForm = false;
  };
  const showForm = () => (isFormOpen = true);
  const hideForm = () => {
    isFormOpen = false;
    setId = null;
    setAmount = null;
    setItemName = "";
    setDate = null;
    setNotes = "";
  };

  const removeExpense = id => {
    expenses = expenses.filter(listItem => listItem.id !== id);
  };

  const clearExpenses = () => {
    const confirmDelete = confirm(
      "Are you sure you would like to delete your Expense List?"
    );
    if (confirmDelete) {
      expenses = [];
    } else {
      return;
    }
  };

  const addExpense = ({ itemName, amount, date, notes }) => {
    let expense = {
      id: Math.random() * Date.now(),
      itemName,
      amount,
      date,
      notes
    };
    expenses = [...expenses, expense];
  };

  const setModifiedExpense = id => {
    let expense = expenses.find(listItem => listItem.id === id);
    setId = expense.id;
    setItemName = expense.itemName;
    setAmount = expense.amount;
    setDate = expense.date;
    setNotes = expense.notes;
    showForm();
  };

  const editExpense = ({ itemName, amount, date, notes }) => {
    expenses = expenses.map(listItem => {
      return listItem.id === setId
        ? { ...listItem, itemName, amount, date, notes }
        : { ...listItem };
    });
    setId = null;
    setAmount = null;
    setItemName = "";
    setDate = null;
    setNotes = "";
  };

  const addUserInfo = ({ userName, email }) => {
    UserInfoName = userName;
  };
  //reactivity
  $: total = expenses.reduce((acc, curr) => {
    return (acc += curr.amount);
  }, 0);
  $: isEditing = setId ? true : false;
  //context
  setContext("remove", removeExpense);
  setContext("modify", setModifiedExpense);
</script>

<style>
  main {
    margin-bottom: 6rem;
  }
</style>

<Navbar />
<main class="content">
  {#if UserForm}
    <UserModal>
      <UserNameForm {addUserInfo} {isEditing} {hideUserForm} />
    </UserModal>
  {/if}
  {#if isFormOpen}
    <Modal>
      <ExpenseForm
        {addExpense}
        itemName={setItemName}
        amount={setAmount}
        date={setDate}
        notes={setNotes}
        {isEditing}
        {editExpense}
        {hideForm} />
    </Modal>
  {/if}
  <Greeting {UserInfoName} {showUserForm} />
  <Totals SectionHeader="total expenses" {total} />
  <ExpensesList {expenses} {showForm} />
  <button
    type="button"
    class="btn btn-primary btn-block"
    on:click={clearExpenses}>
    Clear expenses
  </button>
</main>
