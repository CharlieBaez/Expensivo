<script>
  //plugins
  import { blur, fade, fly } from "svelte/transition";
</script>

<div class="modal-container" in:blur out:fade>
  <div class="modal-content">
    <slot>
      <!-- optional fallback -->
    </slot>
  </div>
</div>
