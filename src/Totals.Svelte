<script>
  //props
  export let SectionHeader = "Section Header";
  export let total = 0;
</script>

<style>
  section {
    margin: 2rem 0;
  }
  span {
    background: LightSeaGreen;
  }
</style>

<section class="main-title">
  <h2>
    {SectionHeader}:
    <span>${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
  </h2>
</section>
