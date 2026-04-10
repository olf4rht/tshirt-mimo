<script lang="ts">
  import DesignSvgRenderer from './DesignSvgRenderer.svelte';
</script>

<div class="design-canvas">
  <DesignSvgRenderer filterId="canvas" />
</div>

<style>
  .design-canvas {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .design-canvas :global(.font-svg) {
    max-width: 80%;
    max-height: 50%;
  }
</style>
