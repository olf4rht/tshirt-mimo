<script lang="ts">
  import { designState } from '$lib/stores/designer';
  import DesignSvgRenderer from './DesignSvgRenderer.svelte';
</script>

<div class="tshirt-preview">
  <svg
    class="shirt-svg"
    viewBox="0 0 400 480"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      d="M 100,0 L 0,80 L 50,130 L 80,110 L 80,460 C 80,475 90,480 100,480 L 300,480 C 310,480 320,475 320,460 L 320,110 L 350,130 L 400,80 L 300,0 C 290,30 260,50 200,50 C 140,50 110,30 100,0 Z"
      fill={$designState.shirtColor}
    />
  </svg>

  <div
    class="design-overlay"
    style="left: {$designState.designX}%; top: {$designState.designY}%; transform: translate(-50%, -50%) scale({$designState.designScale})"
  >
    <DesignSvgRenderer filterId="preview" />
  </div>
</div>

<style>
  .tshirt-preview {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .shirt-svg {
    width: 80%;
    height: 80%;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  }

  .design-overlay {
    position: absolute;
    width: 40%;
    pointer-events: none;
  }

  .design-overlay :global(.font-svg) {
    width: 100%;
    height: auto;
  }
</style>
