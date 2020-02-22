<script>
  //plugin
  import { getContext } from "svelte";
  //components
  //props
  export let UserInfoName = "";
  export let showUserForm;

  //variables
  let todayDate = new Date();
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
</script>

<style type="text/scss">
  section {
    margin-bottom: 3rem;
  }
  h1 {
    font-size: 5vw;
    position: relative;
  }
  h1:hover button {
    opacity: 1;
  }

  button {
    position: absolute;
    bottom: 0;
    right: -10px;
    opacity: 0;
    transition: var(--mainTransition);
    color: var(--button);
  }
  button:hover {
    color: var(--buttonHover);
    transform: scale(1.2);
  }
  span {
    color: var(--button);
  }
  h2 {
    font-size: 3vw;
  }
</style>

<section>
  <div class="todays-date">
    {todayDate.getDate()} {months[todayDate.getMonth()]}, {todayDate.getFullYear()}
  </div>
  <h1>
    Hello,
    <span>{UserInfoName}</span>
    !
    <button class="expense-btn edit-btn" on:click={showUserForm}>
      <i class="fas fa-pen" />
    </button>
  </h1>
  <h2>welcome back</h2>
</section>
